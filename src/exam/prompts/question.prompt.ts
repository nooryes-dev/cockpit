import { ChatPromptTemplate } from '@langchain/core/prompts';

const template = ChatPromptTemplate.fromMessages([
  ChatPromptTemplate.fromTemplate(
    '你现在是一个{position}的面试官，本次面试需要考察候选人的能力，请你给出合理的面试问题。',
  ),
  '面试问题希望通过数组的形式返回，数组中的每一项都是一个问题',
]);

export const useQuestionsPrompt = (position: string) => {
  return template.invoke({
    position,
  });
};
