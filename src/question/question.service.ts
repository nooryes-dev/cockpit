import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Repository } from 'typeorm';
import { User } from '@/libs/database';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '@/libs/database/entities/question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建问题
   */
  async create(createQuestionDto: CreateQuestionDto, createdBy: User) {
    return (
      await this.questionRepository.save(
        this.questionRepository.create({
          topic: createQuestionDto.topic,
          createdById: createdBy.id,
          categoryCode: createQuestionDto.categoryCode,
        }),
      )
    ).id;
  }

  /**
   * @description 更新问题
   */
  async update(id: number, updateQuestionDto: UpdateQuestionDto, user: User) {
    return (
      ((
        await this.questionRepository.update(
          id,
          this.questionRepository.create({
            ...updateQuestionDto,
            updatedById: user.id,
          }),
        )
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 分页获取问题列表
   */
  async questions({ page, pageSize, categoryCode }: QueryQuestionsDto) {
    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .where('1 = 1')
      .orderBy('question.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (!!categoryCode) {
      qb.andWhere('question.categoryCode = :categoryCode', { categoryCode });
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
        category: true,
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
