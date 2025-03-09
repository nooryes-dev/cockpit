import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { DataSource, Repository } from 'typeorm';
import { Category, User } from '@/libs/database';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '@/libs/database/entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @description 创建问题
   */
  async create(createQuestionDto: CreateQuestionDto, createdBy: User) {
    const categories = await this.categoryRepository.findBy({
      code: createQuestionDto.categoryCode,
    });

    return (
      await this.questionRepository.save(
        this.questionRepository.create({
          topic: createQuestionDto.topic,
          createdById: createdBy.id,
          categories,
        }),
      )
    ).id;
  }

  /**
   * @description 更新问题
   */
  async update(
    id: number,
    { categoryCode, ...updateQuestionDto }: UpdateQuestionDto,
    user: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await this.questionRepository.update(
        id,
        this.questionRepository.create({
          ...updateQuestionDto,
          updatedById: user.id,
        }),
      );

      await this.questionRepository
        .createQueryBuilder()
        .relation('categories')
        .of(id)
        .addAndRemove(
          [categoryCode],
          await this.questionRepository
            .createQueryBuilder()
            .relation('categories')
            .of(id)
            .loadMany<Category>(),
        );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return true;
    } catch {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return false;
    }
  }

  /**
   * @description 分页获取问题列表
   */
  async questions({ page, pageSize, categoryCode }: QueryQuestionsDto) {
    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.categories', 'category')
      .where('1 = 1')
      .orderBy('question.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (!!categoryCode) {
      qb.andWhere('category.code = :categoryCode', { categoryCode });
    }

    const [_questions, count] = await qb.getManyAndCount();

    return [
      await this.userService.getUsersByIds(_questions, {
        createdById: 'createdBy',
        updatedById: 'updatedBy',
      }),
      count,
    ];
  }

  question(id: number) {
    return this.questionRepository.findOne({
      where: {
        id,
      },
      relations: {
        categories: true,
      },
    });
  }

  /**
   * @description 删除问题
   */
  async remove(id: number, user: User) {
    return (
      ((
        await this.questionRepository.update(id, {
          deletedAt: new Date(),
          updatedById: user.id,
        })
      ).affected ?? 0) > 0
    );
  }
}
