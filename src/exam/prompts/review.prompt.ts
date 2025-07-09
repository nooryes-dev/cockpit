import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SCORE_SEPARATOR, SPEARATOR } from '../constants';
// import { at } from '@aiszlab/relax';

const template = ChatPromptTemplate.fromMessages([
  ChatPromptTemplate.fromTemplate(
    `你现在是一个{position}的面试官，本次面试过程中，候选人针对以下10个问题进行了回答，问题依次是：
${Array.from({ length: 10 })
  .map((_, index) => {
    const _index = index + 1;
    return `${_index}. {question${_index}}`;
  })
  .join('；')}。
候选人的回答依次是：
${Array.from({ length: 10 })
  .map((_, index) => {
    const _index = index + 1;
    return `${_index}. {answer${_index}}`;
  })
  .join('；')}。`,
  ),
  `
请你针对问题和回答给候选人打分，先给一个总分，然后每一题请给出详细的评价和评分（用百分制）
评价和分数之间使用${SCORE_SEPARATOR}分隔，每题之间使用${SPEARATOR}，内容不要添加换行符
示例如下：
总分${SPEARATOR}评价内容${SCORE_SEPARATOR}80${SPEARATOR}评价内容${SCORE_SEPARATOR}90${SPEARATOR}评价内容${SCORE_SEPARATOR}70
`,
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
    ...Object.fromEntries<string>(
      Array.from({ length: 10 }).map((_, index) => {
        return [`question${index + 1}`, questions.at(index) ?? ''];
      }),
    ),
    ...Object.fromEntries<string>(
      Array.from({ length: 10 }).map((_, index) => {
        return [`answer${index + 1}`, answers.at(index) ?? ''];
      }),
    ),
  });
};

export interface Reviewing {
  revieweds: string[];
  chunk: string;
}
