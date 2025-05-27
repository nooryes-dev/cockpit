import { ChatPromptTemplate } from '@langchain/core/prompts';

const template = ChatPromptTemplate.fromMessages([
  '你现在是一个行业专家，用户输入一个职位名称，你需要将这个职位名称标准化为一个通用的职位名称。',
  ChatPromptTemplate.fromTemplate('输入的职位名称是{position}'),
  '请直接返回标准化后的职位名称，不需要任何其他信息。',
]);

export const usePositionPrompt = (position: string) => {
  return template.invoke({
    position,
  });
};
