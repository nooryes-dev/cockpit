import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SPEARATOR } from '../constants';

const template = ChatPromptTemplate.fromMessages([
  ChatPromptTemplate.fromTemplate(
    `你现在是一个{position}的面试官，本次面试过程中，候选人针对以下10个问题进行了回答，问题依次是：${Array.from(
      { length: 10 },
    )
      .map((_, index) => {
        const _index = index + 1;
        return `${_index}. question${_index}`;
      })
      .join('；')}.
候选人的回答依次是：${Array.from({ length: 10 }).map((_, index) => {
      const _index = index + 1;
      return `${_index}.  answer${_index}`;
    })}.`,
  ),
  `请你针对问题和回答给候选人打分，并且详细评价下候选人的回答，分数请用数字表示，分数和评价之间用${SPEARATOR}拼接，参考样例：8${SPEARATOR}候选人整理能力如何，优点是什么，缺点是什么，需要改进的地方`,
]);

export const useReviewPrompt = ({
  position,
  questions,
  answers,
}: {
  position: string;
  questions: string[];
  answers: string[];
}) => {
  return template.invoke({
    position,
    ...Object.fromEntries(
      questions.map((question, index) => [`question${index + 1}`, question]),
    ),
    ...Object.fromEntries(
      answers.map((answer, index) => [`answer${index + 1}`, answers]),
    ),
  });
};

export interface Reviewing {
  isScored: boolean;
  comments: string;
}
