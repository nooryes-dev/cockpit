import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SPEARATOR } from '../constants';

const template = ChatPromptTemplate.fromMessages([
  ChatPromptTemplate.fromTemplate(
    '你现在是一个{position}的面试官，本次面试需要考察候选人的能力，请你给出10个合理的面试问题。',
  ),
  `每个面试问题希望通过${SPEARATOR}来分割，不要添加任何其他内容`,
]);

export const useQuestionsPrompt = (position: string) => {
  return template.invoke({
    position,
  });
};

export interface Questioning {
  questions: string[];
  chunk: string;
}
