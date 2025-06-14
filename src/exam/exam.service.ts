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
import { type Repository } from 'typeorm';
import {
  concatMap,
  endWith,
  filter,
  map,
  Observable,
  of,
  reduce,
  scan,
} from 'rxjs';
import { usePositionPrompt } from './prompts/position.prompt';
import {
  type Questioning,
  useQuestionsPrompt,
} from './prompts/question.prompt';
import { type SubmitExamDto } from './dto/submit-exam.dto';
import { SPEARATOR } from './constants';
import { type Reviewing, useReviewPrompt } from './prompts/review.prompt';
import { isEmpty, last } from '@aiszlab/relax';
import { operate } from 'rxjs/internal/util/lift';
import { createOperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { COMPLETED_MESSAGE_EVENT, StatusCode } from 'typings/response.types';
import { QueryExamsDto } from './dto/query-exams.dto';
import { UserService } from 'src/user/user.service';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@/libs/config';
import { GenerateExamMessageEvent } from './dto/generate-exam.dto';
import { Voidable } from '@aiszlab/relax/types';
import { ReviewExamMessageEvent } from './dto/review-exam.dto';

@Injectable()
export class ExamService {
  #robot: ChatOpenAI;

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.#robot = new ChatOpenAI({
      model: 'qwen-turbo-2025-04-28',
      configuration: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: configService.alibabaApiKey,
      },
    });
  }

  /**
   * 创建考试
   * @description
   * 用户会输入需要创建考试的职位，利用大模型标准化职位名称
   */
  async create(createExamDto: CreateExamDto, createdById: number) {
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
  generate(id: number) {
    const _questions$ = new Observable<string>((observer) => {
      this.examRepository
        .findOneBy({ id })
        .then(async (_exam) => {
          if (!_exam) throw new Error('考试不存在');

          if (!isGenerable(_exam.status)) {
            observer.next(_exam.questionsMessage);
            return;
          }

          // 更新为生成中
          await this.examRepository.update(id, {
            status: ExamStatus.Generating,
          });
          const _prompt = await useQuestionsPrompt(_exam.position);
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

    const _piped$ = _questions$.pipe(
      scan<string, Questioning>(
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
      operate<Questioning, Voidable<string>[]>((source, subscriber) => {
        let buffer: Voidable<string>[] | null = null;
        source.subscribe(
          createOperatorSubscriber(
            subscriber,
            (value) => {
              buffer?.push(value.chunk);
              subscriber.next(value.questions);
            },
            () => {
              subscriber.next([last(buffer)]);
              subscriber.complete();
            },
            void 0,
            () => {
              buffer = null;
            },
          ),
        );
      }),
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

    // 面试问题生成完成后，更新数据库状态，并将面试问题存储到数据库中
    _piped$
      .pipe(
        reduce<GenerateExamMessageEvent, string[]>((_questions, { data }) => {
          if (data) {
            _questions.push(data);
          }
          return _questions;
        }, []),
      )
      .subscribe((questions) => {
        this.examRepository.update(
          { id, status: ExamStatus.Initialized },
          {
            _questions: JSON.stringify(questions),
            status: ExamStatus.Generating,
          },
        );
      });

    return _piped$;
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
            observer.next(`${_exam.score}${SPEARATOR}${_exam.comments}`);
            throw new Error('状态不允许');
          }

          const _prompt = await useReviewPrompt({
            answers: JSON.parse(_exam.answers ?? '[]'),
            questions: _exam.questions,
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

    _reviewer$.pipe(reduce((prev, chunk) => prev + chunk, '')).subscribe({
      next: (scoreAndComments) => {
        const [score, ...comments] = scoreAndComments.split(SPEARATOR);
        this.examRepository.update(
          { id, status: ExamStatus.Submitted },
          {
            score: Number(score) || 0,
            comments: comments.join(''),
            status: ExamStatus.Frozen,
          },
        );
      },
    });

    return _reviewer$.pipe(
      scan<string, Reviewing>(
        (prev, comments) => {
          return {
            isScored: prev.isScored || comments.includes(SPEARATOR),
            comments: prev.isScored ? comments : prev.comments + comments,
          };
        },
        {
          isScored: false,
          comments: '',
        },
      ),
      filter(({ isScored }) => isScored),
      concatMap(({ comments }) => of(...comments.split(SPEARATOR))),
      filter((scoreOrComments) => !!scoreOrComments),
      map<string, ReviewExamMessageEvent>((scoreOrComments) => ({
        data: scoreOrComments,
      })),
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
}
