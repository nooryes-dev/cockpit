import { Injectable } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Exam,
  ExamStatus,
  isGenerable,
  isReviewable,
  isSubmittable,
} from '@/libs/database/entities/exam.entity';
import { In, Not, type Repository } from 'typeorm';
import { concatMap, endWith, filter, map, Observable, of, scan } from 'rxjs';
import { usePositionPrompt } from './prompts/position.prompt';
import {
  type Questionsing,
  useQuestionsPrompt,
} from './prompts/questions.prompt';
import { type SubmitExamDto } from './dto/submit-exam.dto';
import { SCORE_SEPARATOR, SPEARATOR } from './constants';
import { type Reviewing, useReviewPrompt } from './prompts/review.prompt';
import { isEmpty } from '@aiszlab/relax';
import { COMPLETED_MESSAGE_EVENT, StatusCode } from 'typings/response.types';
import { QueryExamsDto } from './dto/query-exams.dto';
import { UserService } from 'src/user/user.service';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@/libs/config';
import { GenerateExamMessageEvent } from './dto/generate-exam.dto';
import { ReviewExamMessageEvent } from './dto/review-exam.dto';
import { CacheService } from '@/libs/cache';

@Injectable()
export class ExamService {
  #robot: ChatOpenAI;

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.#robot = new ChatOpenAI({
      model: 'qwen3-max',
      configuration: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: this.configService.alibabaApiKey,
      },
    });
  }

  /**
   * 创建考试
   * @description
   * 用户会输入需要创建考试的职位，利用大模型标准化职位名称
   */
  async create(createExamDto: CreateExamDto, createdById: number) {
    // 当前用户存在未冻结的考试时，不允许新建
    if (
      (await this.examRepository.countBy({
        status: Not(In([ExamStatus.Frozen])),
        createdById,
      })) > 0
    ) {
      throw new Error('存在未完成的面试间，不允许新建！');
    }

    // 计算用户额度，超额不允许创建
    await this.cacheService.increaseExamFreeQuota(createdById);

    const position = await usePositionPrompt(createExamDto.position)
      .then((_prompt) => this.#robot.invoke(_prompt))
      .then(({ content }) => content.toString());

    const _exam = await this.examRepository.save(
      this.examRepository.create({ position, createdById }),
    );

    return _exam;
  }

  /**
   * 生成考试内容
   * @description
   * 根据已经落库的条目。生成对应的问题
   */
  questions(id: number) {
    const _questions$ = new Observable<string>((subscriber) => {
      this.examRepository
        .findOneBy({ id })
        .then(async (_exam) => {
          if (!_exam) throw new Error('考试不存在');

          // 考试状态卡控
          if (!isGenerable(_exam.status)) {
            subscriber.next(_exam.questionsChunk);
            return;
          }

          // 更新状态为生成中
          await this.examRepository.update(id, {
            status: ExamStatus.Generating,
          });
          const _prompt = await useQuestionsPrompt(_exam.position);
          for await (const chunk of await this.#robot.stream(_prompt)) {
            subscriber.next(chunk.content.toString());
          }
        })
        .catch((error) => {
          subscriber.error(error);
        })
        .finally(() => {
          subscriber.complete();
        });
    });

    return _questions$.pipe(
      scan<string, Questionsing>(
        (prev, chunk) => {
          const _chunk = prev.chunk + chunk;

          if (!_chunk.includes(SPEARATOR)) {
            return { questions: [], chunk: _chunk };
          }

          const _questions = _chunk.split(SPEARATOR);
          return {
            questions: _questions.slice(0, -1),
            chunk: _questions.at(-1) ?? '',
          };
        },
        {
          questions: [],
          chunk: '',
        },
      ),
      (source) => {
        return new Observable<string[]>((subscriber) => {
          let _questions: string[] | null = [];
          let _lastQuestion: string | null = null;

          source.subscribe({
            next: (value) => {
              _questions?.push(...value.questions);
              _lastQuestion = value.chunk;
              subscriber.next(value.questions);
            },
            complete: () => {
              if (_lastQuestion) {
                _questions?.push(_lastQuestion);
                subscriber.next([_lastQuestion]);
              }

              Promise.all([
                this.examRepository.update(
                  { id, status: ExamStatus.Generating },
                  {
                    questions: JSON.stringify(_questions),
                    status: ExamStatus.Draft,
                  },
                ),
                subscriber.complete(),
              ]);

              return () => {
                _questions = null;
                _lastQuestion = null;
              };
            },
          });
        });
      },
      concatMap((questions) => of(...questions)),
      filter((question) => !isEmpty(question)),
      map<string, GenerateExamMessageEvent>((question) => {
        return {
          data: question,
          type: StatusCode.Continue,
        };
      }),
      endWith<GenerateExamMessageEvent>(COMPLETED_MESSAGE_EVENT()),
    );
  }

  /**
   * 提交
   */
  async submit(id: number, { answers }: SubmitExamDto) {
    const _exam = await this.examRepository.findOneBy({ id });
    if (!_exam) throw new Error('考试不存在');
    if (!isSubmittable(_exam.status)) throw new Error('状态不允许');

    return (
      ((
        await this.examRepository.update(id, {
          status: ExamStatus.Submitted,
          answers: JSON.stringify(answers),
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * 审查考试内容
   */
  review(id: number) {
    const _reviewer$ = new Observable<string>((observer) => {
      this.examRepository
        .findOneBy({ id })
        .then(async (_exam) => {
          if (!_exam) throw new Error('考试不存在');

          if (!isReviewable(_exam.status)) {
            observer.next(_exam.scoreAndComments);
            return;
          }

          const _prompt = await useReviewPrompt({
            answers: _exam.answerList,
            questions: _exam.questionList,
            position: _exam.position,
          });
          for await (const chunk of await this.#robot.stream(_prompt)) {
            observer.next(chunk.content.toString());
          }
        })
        .catch((error) => {
          observer.error(error);
        })
        .finally(() => {
          observer.complete();
        });
    });

    return _reviewer$.pipe(
      scan<string, Reviewing>(
        (prev, chunk) => {
          const _chunk = prev.chunk + chunk;

          if (!_chunk.includes(SPEARATOR)) {
            return { revieweds: [], chunk: _chunk };
          }

          const _questions = _chunk.split(SPEARATOR);
          return {
            revieweds: _questions.slice(0, -1),
            chunk: _questions.at(-1) ?? '',
          };
        },
        {
          revieweds: [],
          chunk: '',
        },
      ),
      (source) => {
        return new Observable<string[]>((subscriber) => {
          let _revieweds: string[] | null = [];
          let _lastReviewed: string | null = null;

          source.subscribe({
            next: (value) => {
              _revieweds?.push(...value.revieweds);
              _lastReviewed = value.chunk;
              subscriber.next(value.revieweds);
            },
            complete: () => {
              if (_lastReviewed) {
                _revieweds?.push(_lastReviewed);
                subscriber.next([_lastReviewed]);
              }

              Promise.all([
                this.examRepository.update(
                  { id, status: ExamStatus.Generating },
                  {
                    comments: JSON.stringify(_revieweds),
                    status: ExamStatus.Frozen,
                  },
                ),
                subscriber.complete(),
              ]);

              return () => {
                _revieweds = null;
                _lastReviewed = null;
              };
            },
          });
        });
      },
      concatMap((revieweds) => of(...revieweds)),
      filter((reviewed) => !isEmpty(reviewed)),
      map<string, ReviewExamMessageEvent>((reviewed) => {
        // reviewed 实际上是评价和分数的拼接，这里再切割一次，转成对象给到前端
        // 如果 score 没有值，直接返回分析结果（总分就是这样）
        const { 0: score, 1: analysis } = reviewed.split(SCORE_SEPARATOR);

        if (!score) {
          return {
            data: analysis,
            type: StatusCode.Continue,
          };
        }

        return {
          data: {
            analysis,
            score,
          },
          type: StatusCode.Continue,
        };
      }),
      endWith<ReviewExamMessageEvent>(COMPLETED_MESSAGE_EVENT()),
    );
  }

  /**
   * 获取当前用户的考试列表
   */
  async exmas({ page, pageSize }: QueryExamsDto, who: number) {
    const qb = this.examRepository
      .createQueryBuilder('exam')
      .where('1 = 1')
      .andWhere('exam.createdById = :who', { who })
      .offset((page - 1) * pageSize)
      .orderBy('exam.createdAt', 'DESC')
      .limit(pageSize);

    const [_articles, count] = await qb.getManyAndCount();

    return [
      await this.userService.getUsersByIds(_articles, {
        createdById: 'createdBy',
        updatedById: 'updatedBy',
      }),
      count,
    ];
  }

  /**
   * @description 获取考试详情
   */
  async exam(id: number) {
    const _exam = await this.examRepository.findOneBy({ id });
    if (!_exam) throw new Error('考试不存在');

    return {
      id: _exam.id,
      position: _exam.position,
      answers: _exam.answerList,
      questions: _exam.questionList,
    };
  }
}
