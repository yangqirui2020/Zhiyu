import { classroomCatalogSchema } from "../../src/domain/schemas/catalog.ts";

export const classroomCatalog = classroomCatalogSchema.parse([
  { number: "101", questionId: "q_learn_programming", title: "零基础想学编程，应该从哪门语言开始入门比较好？", subtitle: "从语言选择，找到适合自己的起点", mode: "snapshot", nextQuestionId: "q_projects_and_foundations", connection: "选好第一门语言之后，遇到卡点该继续做项目，还是回头补基础？", sampleId: "sample_learn_programming_v1" },
  { number: "102", questionId: "q_projects_and_foundations", title: "学编程，先系统学基础，还是直接做项目？", subtitle: "从怎么开始，走到怎样持续学下去", mode: "mock", nextQuestionId: "q_learning_with_ai", connection: "项目能运行还不够。如果 AI 帮你写好了代码，怎样判断自己能独立理解与修改？", sampleId: "sample_projects_and_foundations_v1" },
  { number: "103", questionId: "q_learning_with_ai", title: "有了 AI 编程工具，初学者还需要自己写代码吗？", subtitle: "在工具的帮助下，保留自己的判断", mode: "mock", nextQuestionId: "q_learn_programming", connection: "带着对工具和自主练习的新判断，回到起点：现在你会怎样选择第一门语言？", sampleId: "sample_learning_with_ai_v1" },
]);

export const findClassroom = (questionId: string) => classroomCatalog.find(room => room.questionId === questionId);
export const classroomHref = (questionId: string) => `/classroom/${questionId}`;
