# TASK-015 — Demo V3 Learning Loop（完整认知闭环）

- Status: Done
- Owner: Primary Agent (WorkBuddy)
- Estimate: 5h
- Freeze deadline: End of current iteration
- Base: `main` @ `fd602fa`（checkpoint/TASK-014-pixel-classroom）
- Branch: `task/TASK-015-learning-loop`

## Goal

在现有像素课堂 Demo 上完成 Experience Flow 重构：主流程从「聚类 → 候选座 → 同桌 → 结束」升级为完整学习闭环——
**看懂全班 → 课代表圆桌（听见争议）→ 黑板三项 → 用户表达（找到自己）→ 候选座 → 同桌追问（认知摩擦）→ 用户回应 → 课堂笔记（认知变化）→ 《我的一席》（知识产物）→ 留下我的一席（入席，40→41）→ 两个出口（去知乎写下这一席 / 去下一间教室）**。

## Why in Golden Path

Demo V2 的断点：匹配完成后没有真正发生学习（无观点碰撞、无认知变化、无知识沉淀、无下一步行动）。本任务在不改 Domain Contract、不改 40 人 fixture、不换技术栈的前提下，把「同桌」从 QA 机器人收束为「制造一次有效认知摩擦」的角色，并新增课堂笔记（过程）→《我的一席》（结果）→ 入席（情绪闭环）→ 双出口（知识生产 / 学习探索）。

本任务的用户指令（Demo V3 收束稿）是最高优先级规范；与 UX-001/PROD-001 旧 Golden Path 的冲突按 AGENTS.md §2 第 1 条裁决，术语统一记录于 PDR-0004。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-014 Done；基线 fd602fa typecheck/lint/test 全绿。
- Inputs: 现有像素课堂、`DemoSeatmateScenario` fixture 思路、40 人 Mock 教室、PixelStudentPortrait。
- Outputs: `DemoScenario` V3 fixture、Session 判别联合状态机、课代表圆桌舞台、动态黑板三项、同桌追问+用户回应、课堂笔记（四段渐进生长+Diff）、《我的一席》、入席动画、双出口、102/103 Mock Entry、视觉验证报告。

## Scope

- Allowed Files:
  - `data/fixtures/scenarios/learn-programming-demo-v3.ts`（新增）
  - `src/features/classroom/**`（ClassroomExperience / ClassroomContextRail / ForceGraphCanvas / pixel-character / classroom.module.css / 新增 session-machine.ts、RoundtableOverlay.tsx、ClassroomNotePanel.tsx）
  - `src/app/**`（page 文案与 fixture 接线）
  - `docs/decisions/pdr/PDR-0004-demo-v3-learning-loop.md`（新增）
  - `tasks/README.md`、本任务文件、`README.md`
  - `verification/TASK-015/**`
- Forbidden Files: `src/domain/**`、`src/contracts/**`、`src/server/**`、`data/fixtures/classrooms/**`（40 人 fixture 原样保留）、`data/snapshots/**`、依赖清单、frozen Design Token 值、既有 TASK-013/014 验收物。
- Non-Scope: AI 老师、无限自由聊天、真多 Agent 长轮辩论、多用户实时、好友/排行/等级/成就、多同桌、真实知乎发布、真实数据库、自由拖拽换座、任意笔记分析、真实多教室加载（102/103 仅 Mock Entry）、依赖增删升级。

## Contracts & Decisions

- CONTRACT-DOMAIN-001 rc.1、CONTRACT-STATE-001 rc.1：不变（本任务不触碰 domain schema）。
- PDR-0004（本任务新增）：V3 产品主线收束 + 术语统一（Candidate Seat / 你的一席 / 留下我的这一席 / 入席 四词分义）。
- 规范冲突裁决：用户 V3 指令 > PDR-0004 > 既有 Frozen spec（AGENTS.md §2）。

## States / Events / Guards / Effects / Recovery

Session 相位（判别联合，禁止 boolean 堆叠）：

```text
exploring            初始：探索学生/组；主 CTA = 听听各组怎么说
roundtable           课代表圆桌进行中（可跳过；Reduced Motion 直达结论）
reflection           黑板三项已上板；输入区解锁「听完他们，你现在怎么看？」
candidate            观点提交后空位亮起（沿用 exact-sample guard）
seatmate             同桌面板：为什么是他 +「让他追问我」
challenge            同桌追问展示，等待用户回应（文本框 + 演示答案填充）
responded            用户已回应 → 课堂笔记四段完整展示（Before/After Diff）
mySeat               《我的一席》展示；主 CTA「留下我的这一席」
seated               入席完成（角色坐进空位、40→41、同桌响应）→ 双出口面板
```

Guards / Recovery：
- 圆桌未完成不得进入 reflection；未提交观点不得出现同桌/笔记③④；未入席前候选座保持琥珀空位态。
- 圆桌跳过 = 直接写黑板三项并进入 reflection；不阻塞 Golden Path。
- 输入只接受 exact sample（沿用 TASK-013 guard，诚实披露，不给任意文本伪回退）。
- `reset`：回到 exploring，黑板清空三项、人数回 40、笔记清空；不重播教室入场。
- 学生选择仍为正交 panel，可中断任何相位，关闭后回到当前相位的默认面板。

## Exact UI Copy

- 圆桌入口：「听听各组怎么说」；圆桌说明：「课代表是 AI 基于本组内容归纳 · 非任何真实答主 · 不代表知乎立场」
- 黑板三项标题：全班共识 / 核心争议 / 尚未解决的问题
- 输入区：「听完他们，你现在怎么看？」
- 同桌追问入口：「让他追问我」；追问说明：「预设追问 · 针对你的观点漏洞 · 非实时 AI 回复」
- 课堂笔记四段：① 上课前，我认为 ② 这节课，我听到了 ③ 最让我重新思考的是 ④ 下课时，我现在认为
- 《我的一席》四节：我的观点 / 我的理由 / 我补上的条件 / 与已有讨论相比
- 入席 CTA：「留下我的这一席」；入席后状态：「你已入席 · 本班 41 人」
- 出口 A：「去知乎写下这一席」（回答提纲 · Mock，支持复制）；出口 B：「去下一间教室」（102，由本班尚未解决的问题生长而来）
- 禁用词红线照旧：不得出现「全新观点 / 知识空白 / 新颖度 / 掌握证明 / 支持率 / 正确性」。

## Edge Cases

- Reduced Motion：圆桌直达黑板结论；入席直接淡入最终态。
- 圆桌中点学生：允许，关闭详情后圆桌 overlay 仍在原进度。
- 回应为空：禁用提交；「使用演示答案」一键填充。
- 第二次演示：reset 后圆桌可重播；笔记重新生长。
- 390×844：圆桌 overlay 全屏化；笔记/我的一席/出口改纵向段落。

## Acceptance Criteria

- [ ] A. 课代表圆桌：5 组课代表完成一轮结构化讨论（预生成、≤15s、可跳过），发生在教室舞台内而非 Modal。
- [ ] B. 黑板三项：圆桌后黑板明确写入 共识 / 争议 / 尚未解决，并保持可见至 reset。
- [ ] C. Reflection 顺序：输入区在圆桌完成后才出现，文案为「听完他们，你现在怎么看？」。
- [ ] D. Candidate Seat：沿用现有空位亮起 + 位置解释，不回归。
- [ ] E. 同桌追问：同桌面板含「为什么是他」+「让他追问我」；追问针对观点漏洞；无自由聊天。
- [ ] F. 用户回应：用户可输入/填充回应，提交后推进相位。
- [ ] G. 课堂笔记：四段结构随相位渐进生长（①reflection 后 ②candidate 后 ③challenge 后 ④responded 后）。
- [ ] H. Cognition Diff：一眼看出 Before ≠ After（高亮新增条件/关键变化）。
- [ ] I. 《我的一席》：四节结构由课堂笔记沉淀生成。
- [ ] J. 入席：点击「留下我的这一席」后空位态 → 用户像素角色坐进座位，人数 40→41，同桌有轻响应。
- [ ] K. 知识出口：知乎回答提纲（Mock）可查看并复制。
- [ ] L. 学习出口：102 教室入口与本班「尚未解决的问题」有明确因果文案；102/103 为诚实 Mock Entry。
- [ ] M. 稳定演示：Golden Path 全程无 console error；1440×900 / 1366×768 / 390×844 截图齐全。

## Verification

- Commands: `npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`git diff --check`。
- Browser: 7 场景（多组可辨 / 圆桌进行中 / 黑板扫读 / 候选座 Wow / 同桌追问 / Before≠After / 入席感）+ reset + Reduced Motion。
- Artifacts: `verification/TASK-015/report.md` + 三视口截图。

## Do Not / Rollback / Blocker Rule

Do not：把圆桌做成多 Agent 自由辩论；把课堂笔记做成全班 AI Summary；把同桌做成通用 Chat Bot；显示未披露的模式切换；修改 40 人 fixture 或 Domain Schema。
Rollback：`git switch main`（基线 fd602fa 即 TASK-014 完整态）；或 `git branch -D task/TASK-015-learning-loop`。
Blocker：按 AGENTS.md §11 建 `tasks/blocked/BLOCK-xxx.md`，不猜测性降级。

## Docs to Update

`tasks/README.md`、本任务、`docs/decisions/pdr/PDR-0004-demo-v3-learning-loop.md`、`verification/TASK-015/report.md`、`README.md`（体验描述变化）。
