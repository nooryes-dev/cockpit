import { Injectable, MessageEvent } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Exam } from '@/libs/database/entities/exam.entity';
import { Repository } from 'typeorm';
import { ChatAlibabaTongyi } from '@langchain/community/chat_models/alibaba_tongyi';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { Observable } from 'rxjs';
import { usePositionPrompt } from './prompts/position.prompt';
import { useQuestionsPrompt } from './prompts/question.prompt';

@Injectable()
export class ExamService {
  #robot: ChatAlibabaTongyi;
  #positionPrompt = ChatPromptTemplate.fromMessages([
    '你现在是一个行业专家，用户输入一个职位名称，你需要将这个职位名称标准化为一个通用的职位名称。',
    SystemMessagePromptTemplate.fromTemplate('输入的职位名称是{positionName}'),
  ]);

  constructor(
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {
    this.#robot = new ChatAlibabaTongyi({
      model: 'qwen-plus',
    });
  }

  /**
   * 正在创建的考试
   */
  _exams: Map<number, any> = new Map();

  /**
   * 创建考试
   * @description 用户在前端页面创建异常考试
   * 1. 用户会输入需要创建考试的职位，利用大模型标准化职位名称
   * 2. 大模型根据标准化的职位，创建开始题目
   * 3. 服务端记录当前考试的内容，并生成一条历史记录
   */
  create(createExamDto: CreateExamDto) {
    return new Observable<MessageEvent>((observer) => {
      Promise.all([
        this.examRepository.save(this.examRepository.create()),
        usePositionPrompt(createExamDto.position)
          .then((_prompt) => this.#robot.invoke(_prompt))
          .then(({ content }) => content.toString())
          .then((_position) => useQuestionsPrompt(_position)),
      ])
        .then(({ 1: _prompt }) => {
          for (const chunk in this.#robot.stream(_prompt)) {
            observer.next({
              data: chunk,
            });
          }
        })
        .catch((error) => {
          observer.error(error);
        })
        .finally(() => {
          observer.complete();
        });
    });
  }
}
