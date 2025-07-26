import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SCORE_SEPARATOR, SPEARATOR } from '../constants';

const TOTAL = 10;
const SAMPLES = `
60
@@@
60$$$本题考察候选人实战能力、基础理论掌握度及技术视野的经典问题，其核心考点可拆解为以下 5 个层面：
1. 对响应式布局本质的理解
2. 技术方法的原理与适用场景
3. 细节处理能力
4. 技术视野与工具链掌握
5. 实战经验与问题解决能力
从上述考点来看，该回答具体分析如下：
1. 覆盖范围过窄，遗漏核心细节：未提及响应式布局的 “基础前提”：如meta viewport标签（<meta name="viewport" content="width=device-width, initial-scale=1.0">）—— 这是响应式布局生效的必要条件（若缺失，移动端会默认按 980px 宽渲染，导致布局错乱），属于 “必须掌握的基础”；
2. 方法描述无原理与场景，深度不足：媒体查询：未说明其作用（“根据视口宽度 / 分辨率等特性，为不同条件应用不同 CSS 规则”）、核心语法（如@media (max-width: 768px)）或断点设计原则（如 “基于内容断点” 而非 “固定设备尺寸”）；
3. 缺乏技术链与实战视野：框架工具：如 Bootstrap 的栅格系统（基于 “12 列网格 + 媒体查询” 的封装，简化响应式开发），其底层逻辑与原生方法的关联；
总结与后续追问建议：候选人的回答勉强覆盖了核心技术方法，但缺乏深度、细节和视野，仅能证明其 “知道这些名词”，但无法确认其 “理解原理、能解决实际问题”。
@@@
70$$$“解释闭包并说明应用场景” 是前端面试中考察候选人JavaScript 核心原理理解、实战经验及代码设计能力的高频问题，其核心考点可拆解为以下 4 个层面：
1. 对闭包本质的理解
2. 闭包的形成条件与底层原理
3. 应用场景的深度与广度
4. 对闭包副作用的认知
从上述考点来看，该回答具体分析如下：
值得肯定的部分：
1. 抓住了闭包的核心表象：准确指出 “访问外部函数作用域变量”“外部函数执行完毕后仍可访问” 这两个闭包的关键特征，说明候选人对闭包的基本现象有认知；
2. 关联了常见场景：提到 “函数嵌套及回调”，暗示候选人在实际代码中观察过闭包的出现场景，并非纯理论记忆；
3. 触及实现机制的核心：“记住定义时的作用域环境” 虽简略，但点出了闭包的本质（作用域的保存），而非停留在 “语法层面”。
明显的不足与深度缺失：
1. 对 “底层原理” 的解释模糊，候选人提到 “记住作用域环境”，但未说明 “如何记住”：未提及 “作用域链”（内部函数的作用域链包含外部函数的变量对象，这是能访问外部变量的直接原因）；未解释 “变量对象的保存机制”（外部函数执行完毕后，其活动对象本应被垃圾回收，但因被内部函数的作用域链引用而保留）。这种模糊可能反映候选人对 JavaScript 执行上下文（Execution Context）的理解不足。
2. “应用场景” 的描述过于笼统
3. 未提及闭包的 “副作用”：闭包的 “内存占用” 是其不可忽视的特性，但候选人完全未提及
`.replaceAll('\n', '');

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
请你针对全部问题和回答给候选人打分，先给一个总分，然后每一题请给出评分（用百分制）和详细的分析和正确的答案。
总分和每题结果之间使用${SPEARATOR}分隔，评分和评价之间使用${SCORE_SEPARATOR}分隔，每题结果之间使用${SPEARATOR}分隔。
分隔符前后不要添加换行符和空格。以下是示例：${SAMPLES}`,
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
