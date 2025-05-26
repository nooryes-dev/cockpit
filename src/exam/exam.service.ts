import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from '@/libs/database/entities/exam.entity';
import { Repository } from 'typeorm';
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';
import { concatMap, filter, map, Observable, of, scan } from 'rxjs';
import { usePositionPrompt } from './prompts/position.prompt';
import { SPEARATOR, useQuestionsPrompt } from './prompts/question.prompt';

@Injectable()
export class ExamService {
  #robot: ChatAlibabaTongyi;

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {
    this.#robot = new ChatAlibabaTongyi({
      model: 'qwen-plus',
    });
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
  generate(id: number) {
    const _creator = new Observable<string>((observer) => {
      this.examRepository
        .findOneBy({ id })
        .then((exam) => {
          if (!exam) throw new Error('考试不存在');
          return useQuestionsPrompt(exam.position);
        })
        .then((_prompt) => {
          for (const chunk in this.#robot.stream(_prompt)) {
            observer.next(chunk);
          }
        })
        .catch((error) => {
          observer.error(error);
        })
        .finally(() => {
          observer.complete();
        });
    });

    return _creator.pipe(
      scan<string, { question: string[]; chunks: string }>(
        (prev, chunk) => {
          if (!chunk.includes(SPEARATOR)) {
            return { question: [], chunks: prev.chunks + chunk };
          }

          const _questions = chunk.split(SPEARATOR);
          return {
            question: [
              _questions.at(0) + prev.chunks,
              ..._questions.slice(1, -1),
            ],
            chunks: _questions.at(-1) ?? '',
          };
        },
        {
          question: [],
          chunks: '',
        },
      ),
      filter(({ question }) => question.length > 0),
      concatMap(({ question }) => of(...question)),
      map<string, MessageEvent>((question) => ({
        data: question,
      })),
    );
  }
}
