import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SCORE_SEPARATOR, SPEARATOR } from '../constants';
// import { at } from '@aiszlab/relax';

const TOTAL = 10;

const TEMPLATE_SCORES = Array.from({ length: TOTAL }).map(() => {
  return Math.ceil(Math.random() * 100);
});
const TOTAL_SCORE = TEMPLATE_SCORES.reduce((prev, cur) => prev + cur, 0) / 10;

console.log('TOTAL_SCORE===', TOTAL_SCORE);

const template = ChatPromptTemplate.fromMessages([
  ChatPromptTemplate.fromTemplate(
    `你现在是一个{position}的面试官，本次面试过程中，候选人针对以下10个问题进行了回答，问题依次是：
${Array.from({ length: TOTAL })
  .map((_, index) => {
    const _index = index + 1;
    return `${_index}. {question${_index}}`;
  })
  .join('；')}。
候选人的回答依次是：
${Array.from({ length: TOTAL })
  .map((_, index) => {
    const _index = index + 1;
    return `${_index}. {answer${_index}}`;
  })
  .join('；')}。`,
  ),
  `
请你针对全部问题和回答给候选人打分，先给一个总分，然后每一题请给出评分（用百分制）和详细的评价。
总分和每题结果之间使用${SPEARATOR}分隔，评分和评价之间使用${SCORE_SEPARATOR}分隔，每题结果之间使用${SPEARATOR}分隔。
注意：分隔符前后不要添加换行符。
以下是3题的示例，其他数量题目以此类推：
${TOTAL_SCORE}${SPEARATOR}${Array.from({ length: TOTAL })
    .map((_, index) => {
      return `${TEMPLATE_SCORES[index]}${SCORE_SEPARATOR}详细的评价`;
    })
    .join(SPEARATOR)}
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
