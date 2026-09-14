import { experienceInputSchema } from "../../src/domain/schemas/contribution.ts";

export const contributionInvitations = {
  q_learn_programming: {
    invitation: "你选第一门编程语言时，有哪次尝试改变了原来的打算？",
    example: experienceInputSchema.parse({ kind: "experience", origin: "example", event: "我是一名虚构的新手，想学 Python 整理社团报名表。第一天没有做出表格功能，而是花了很久安装环境，一度以为自己不适合学编程。", action: "我先在能直接运行代码的环境里验证一个读取文件的小例子，把配置问题与代码问题分开记录，再把目标缩小为检查一列表格。", outcome: "小例子当天跑通了，但我还不能判断这种试学办法对复杂项目是否有效。" }),
  },
  q_projects_and_foundations: {
    invitation: "做项目卡住时，你怎样判断该继续试，还是回头补基础？",
    example: experienceInputSchema.parse({ kind: "condition", origin: "example", event: "这是虚构示例：我做课程提醒工具时页面能显示，但修改日期后提醒没有变化。我不知道该继续问 AI，还是重新学一遍前端课程。", action: "我把问题缩小为一个日期输入和一条提醒，记录输入、保存值与显示值，发现自己没有理解状态更新，于是只补了这一节基础知识。", outcome: "修正后这次修改可以生效，但其他流程还没测试，我不能据此说整个工具已经可靠。" }),
  },
  q_learning_with_ai: {
    invitation: "你用 AI 做完一个东西后，在哪一步发现自己还需要亲自理解？",
    example: experienceInputSchema.parse({ kind: "counterexample", origin: "example", event: "这是虚构经历：我用 AI 做了一个社团报名页，表单和成功提示都很好看。我起初以为能显示成功，就说明已经完成了报名功能。", action: "我关掉页面再打开，发现名单没有新增，于是用两条不同的报名记录检查保存与读取，并逐步核对请求返回和存储结果。", outcome: "我补上保存逻辑后才通过这两条测试。这个例子提醒我生成页面不等于完成验证，但还不能说明所有 AI 代码都不可靠。" }),
  },
} as const;

export function invitationFor(questionId: string) {
  return contributionInvitations[questionId as keyof typeof contributionInvitations] ?? contributionInvitations.q_learning_with_ai;
}
