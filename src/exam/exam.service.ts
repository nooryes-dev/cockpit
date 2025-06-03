import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Exam,
  ExamStatus,
  isQuestionsGenerable,
  isReviewable,
  isSubmittable,
} from '@/libs/database/entities/exam.entity';
import { type Repository } from 'typeorm';
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';
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
import { isEmpty } from '@aiszlab/relax';
import { operate } from 'rxjs/internal/util/lift';
import { createOperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { COMPLETED_MESSAGE_EVENT, StatusCode } from 'typings/response.types';

@Injectable()
export class ExamService {
  #robot: ChatAlibabaTongyi;
  #questions$: Map<number, Observable<string>>;

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {
    this.#robot = new ChatAlibabaTongyi({
      model: 'qwen-turbo-2025-04-28',
    });
    this.#questions$ = new Map();
  }

  /**
   * 创建考试
   * @description
   * 用户会输入需要创建考试的职位，利用大模型标准化职位名称
   */
  async create(createExamDto: CreateExamDto) {
    const position = await usePositionPrompt(createExamDto.position)
      .then((_prompt) => this.#robot.invoke(_prompt))
      .then(({ content }) => content.toString());

    const _exam = await this.examRepository.save(
      this.examRepository.create({ position }),
    );

    return _exam;
  }

  /**
   * 生成考试内容
   * @description
   * 根据已经落库的条目。生成对应的问题
   */
  generateQuestions(id: number) {
    const _questions$ =
      this.#questions$.get(id) ??
      new Observable<string>((observer) => {
        this.examRepository
          .findOneBy({ id })
          .then(async (_exam) => {
            if (!_exam) throw new Error('考试不存在');

            if (!isQuestionsGenerable(_exam.status)) {
              observer.next(_exam.questions ?? '');
              return;
            }

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

    // 缓存问题生成流，保证同一时间只有一个生成流
    this.#questions$.set(id, _questions$);
    _questions$.pipe(reduce((prev, chunk) => prev + chunk, '')).subscribe({
      next: (questions) => {
        this.examRepository.update(
          { id, status: ExamStatus.Initialized },
          {
            questions,
            status: ExamStatus.Draft,
          },
        );
      },
      complete: () => {
        this.#questions$.delete(id);
      },
      error: () => {
        this.#questions$.delete(id);
      },
    });

    return _questions$.pipe(
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
      operate<Questioning, Questioning>((source, subscriber) => {
        let buffer: Questioning[] | null = [];
        source.subscribe(
          createOperatorSubscriber(
            subscriber,
            (value) => {
              buffer?.push(value);
              subscriber.next(value);
            },
            () => {
              const _last = buffer?.at(-1);
              subscriber.next({ questions: [_last?.chunk ?? ''], chunk: '' });
              subscriber.complete();
            },
            undefined,
            () => {
              buffer = null;
            },
          ),
        );
      }),
      filter(({ questions }) => !isEmpty(questions)),
      concatMap(({ questions }) => of(...questions)),
      filter((question) => !isEmpty(question)),
      map<string, MessageEvent>((question) => ({
        data: question,
        type: StatusCode.Continue,
      })),
      endWith<MessageEvent>(COMPLETED_MESSAGE_EVENT()),
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
            observer.next(`${_exam.score}${SPEARATOR}${_exam.comments}`);
            throw new Error('状态不允许');
          }

          const _prompt = await useReviewPrompt({
            answers: JSON.parse(_exam.answers ?? '[]'),
            questions: _exam.questions?.split(SPEARATOR) ?? [],
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
      map<string, MessageEvent>((scoreOrComments) => ({
        data: scoreOrComments,
      })),
      endWith<MessageEvent>(COMPLETED_MESSAGE_EVENT()),
    );
  }
}
