import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Repository } from 'typeorm';
import { User } from '@/libs/database';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Question,
  QuestionStatus,
} from '@/libs/database/entities/question.entity';
import {
  SearchedQuestionDto,
  SearchQuestionsDto,
} from './dto/search-questions.dto';
import {
  CountByTechStackCodeDto,
  CountedByTechStackCodeDto,
} from './dto/count-by-tech-stack.dto';
import { BatchImportDto } from 'src/article/dto/batch-import.dto';
import { tryParse } from '@aiszlab/relax';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建问题点
   */
  async create(createQuestionDto: CreateQuestionDto, createdBy: User) {
    return (
      await this.questionRepository.save(
        this.questionRepository.create({
          ...createQuestionDto,
          createdById: createdBy.id,
        }),
      )
    ).id;
  }

  /**
   * @description 更新问题点
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto, user: User) {
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
   * @description 分页获取问题点列表
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

  /**
   * @description 查询问题点明细
   */
  question(id: string) {
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
   * @description 删除问题点
   */
  async remove(id: string, user: User) {
    return (
      ((
        await this.questionRepository.update(id, {
          deletedAt: new Date(),
          updatedById: user.id,
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description C端搜索问题点
   */
  async search({
    categoryCode,
    keyword,
    page = 1,
    pageSize = 10,
    hasContent = 'y',
    sequence = 'ASC',
  }: SearchQuestionsDto) {
    // 如果没有传入categoryCode，那么pageSize最多为20
    if (!categoryCode) {
      pageSize = Math.min(pageSize, 20);
    }

    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndMapOne('question.category', 'question.category', 'category')
      .leftJoinAndMapOne(
        'category.techStack',
        'category.techStack',
        'techStack',
      )
      .where('question.status IN (:...questionStatuses)', {
        questionStatuses: Question.validStatuses,
      })
      .orderBy('question.updatedAt', sequence)
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (!!categoryCode) {
      qb.andWhere('question.categoryCode = :categoryCode', { categoryCode });
    }

    if (!!keyword) {
      qb.andWhere('question.topic REGEXP :keyword', { keyword });
    }

    const [_questions, count] = await qb.getManyAndCount();

    return [
      _questions.map<SearchedQuestionDto>((_question) => {
        return {
          id: _question.id,
          topic: _question.topic,
          answer: hasContent === 'y' ? _question.answer : undefined,
          categoryCode: _question.categoryCode,
          categoryName: _question.category.name,
          techStackCode: _question.category.techStack.code,
        };
      }),
      count,
    ] as const;
  }

  /**
   * @description 查询热门的问题点
   */
  async hot() {
    return (
      await this.questionRepository
        .createQueryBuilder('question')
        .where('question.status IN (:...questionStatuses)', {
          questionStatuses: Question.validStatuses,
        })
        .leftJoinAndMapOne('question.category', 'question.category', 'category')
        .leftJoinAndMapOne(
          'category.techStack',
          'category.techStack',
          'techStack',
        )
        .limit(10)
        .orderBy({
          'question.updatedAt': 'DESC',
        })
        .getMany()
    ).map<SearchedQuestionDto>((_question) => {
      return {
        id: _question.id,
        topic: _question.topic,
        answer: _question.answer,
        categoryCode: _question.categoryCode,
        categoryName: _question.category.name,
        techStackCode: _question.category.techStack.code,
      };
    });
  }

  /**
   * @description 按技术栈统计问题点数量
   */
  async countByTechStackCode({ techStackCode }: CountByTechStackCodeDto) {
    const qb = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .select('COUNT(*)', 'total')
      .where('question.status IN (:...questionStatuses)', {
        questionStatuses: Question.validStatuses,
      });

    if (techStackCode) {
      qb.andWhere('category.techStackCode = :techStackCode', { techStackCode });
    }

    return await qb.getRawOne<CountedByTechStackCodeDto>();
  }

  /**
   * @description 更新问题点状态
   */
  async updateStatus(id: string, status: QuestionStatus, updatedById: number) {
    return (
      ((
        await this.questionRepository.update(id, {
          status,
          updatedById,
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 批量导入
   */
  async batchImport(
    batchImport: Omit<BatchImportDto, 'importType'>,
    createdById: number,
  ) {
    // 反序列化 content
    const _content =
      (tryParse(batchImport.content) as
        | {
            title: string;
            content: string;
          }[]
        | null) ?? [];

    if (_content.length === 0) {
      throw new BadRequestException('导入内容格式错误');
    }

    const _questions = await this.questionRepository.save(
      _content.map(({ title, content }) => {
        return this.questionRepository.create({
          topic: title,
          answer: content,
          categoryCode: batchImport.categoryCode,
          createdById,
        });
      }),
    );

    return _questions.length > 0;
  }
}
