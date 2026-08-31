# AGENTS.md — 知遇·一席开发协议

本文件是所有人类开发者和 Coding Agent 的强制入口。目标是执行规格，而不是重新设计产品。

## 1. 开工前必读顺序

1. `AGENTS.md`
2. `docs/INDEX.md`
3. `docs/IMPLEMENTATION_MASTER_PLAN.md`
4. `docs/product/PRODUCT_SPEC.md`
5. 与任务相关的 UX、Design、Architecture、Contract、Decision Record
6. 当前 `TASK-xxx` 文件

没有信息完整的 `TASK-xxx`，不得写业务代码。任务依赖未完成，不得绕过依赖开工。

## 2. 规范优先级

冲突时按以下顺序裁决：

1. 用户当前明确指令
2. Accepted Decision Record
3. Frozen Domain / API / State Contract
4. Frozen Product / UX / Design Spec
5. Active Task 的 Acceptance Criteria
6. 实现、测试、README 与代码注释

若同一层级冲突，停止冲突部分，提交 Proposal 或 Blocker；不得自行选择喜欢的一版。

## 3. 决策状态

- 【Frozen】：未经新 Decision Record 不得改变。
- 【Decision Needed】：实现前必须得到明确结论。
- 【Deferred】：不进入当前 P0；记录但不顺手实现。
- 【Won't Do V1】：第一版禁止实现。

## 4. Frozen 范围

- “一道问题 = 一间教室”的产品隐喻与 Golden Path。
- Candidate Seat 在原教室内出现，并只表示当前样本覆盖较少。
- 禁止把“笔记里写过”表述成“系统证明用户掌握”。
- 学生、课代表、Candidate Seat 的角色边界和可信度措辞。
- Domain Schema、API envelope、事件名、Provider boundary、Snapshot provenance。
- Design Tokens、核心布局、信息层级和动效语义。
- Next.js App Router 单体、Zod 单一真相源、Snapshot-first Demo 方向。

## 5. 必须先写 Proposal 的改动

- 增删或升级依赖；替换 Next.js、AI、Embedding、Zhihu、聚类或可视化方案。
- 修改 Schema、API、错误码、事件、状态转移、Provider Port。
- 修改 Golden Path、P0、固定文案、核心 Design Token 或布局。
- 扩大任务范围、跨模块重构、目录迁移。

Proposal 必须使用 `docs/templates/PROPOSAL_TEMPLATE.md`，按 `Problem → Evidence → Impact → Alternative → Migration Cost → Recommendation` 提交。Accepted Record 不原地改结论；推翻时新增 Record 并写 `Supersedes`。

## 6. 实现边界

- 只修改 Task 的 `Allowed Files`；越界先更新 Task/Proposal。
- Schema 只从 `src/domain` 导入；TypeScript 类型从 Zod schema 推导。
- UI、API、LLM structured output、Snapshot、Mock、测试共用同一 Domain Schema。
- UI 不直接调用知乎/LLM/Embedding SDK；Provider 外不得出现厂商调用。
- Prompt、Secret、Provider SDK 只在 server 边界；禁止进入 Client bundle。
- 禁止创建无边界 `utils/`；共享能力必须属于清楚的 domain/feature/server 模块。
- 状态采用判别联合 + reducer/machine；禁止堆叠互斥的 `isLoading/isAnalyzing/showResult`。
- 不提交密钥、`.env.local`、未脱敏个人笔记或真实用户敏感内容。

## 7. 产品与可信度红线

禁止使用：

- “知乎没有这个观点”“全新观点”“知识空白”“新颖度 87%”。
- “聚类代表正确性/支持率/社会共识”。
- “系统证明你已经掌握”。
- 把搜索摘要称为全文或伪造“原文引用”。
- 把学生包装成 Agent、把课代表包装成真实答主或知乎立场。
- 未披露的 Live → Snapshot/Mock 切换。
- 给任意用户笔记返回不匹配的预计算 Candidate Seat。
- 生成完整知乎回答正文。

所有引文必须引用已验证 `evidenceId`；展示文本由服务端从已校验的摘要或笔记区间解析，LLM 不得自由生成引用。

## 8. Snapshot / Mock 规则

- Snapshot = 真实历史数据的不可变资产，可用于 Demo；必须有来源、抓取时间、schema/pipeline/prompt/model 版本与校验和。
- Mock = 人工测试数据，只能用于测试、Storybook 或显式开发模式。
- Sample = 明确提供给用户的示例笔记。
- Vercel 运行时只读 Snapshot，不向部署文件系统“落盘”。
- Classroom Live 失败可回退同一问题的 Snapshot，并显式显示模式。
- Candidate Seat 只有 `sampleId` 或规范化笔记 hash 精确命中时才能回退预计算结果；否则保留输入并提供 Retry / 使用示例。

## 9. 多 Agent 与 Git

- 一项 Task 只有一个 owner；一名 Agent 对应一个分支/worktree。
- 共享 Contract 必须先合并冻结，消费者才可并行。
- 禁止两个 Agent 同时修改同一状态机、Contract 或 Design Token。
- 分支：`task/TASK-xxx-short-name`；文档：`docs/ADR-xxx-short-name`；修复：`hotfix/TASK-xxx-short-name`。
- 提交：`type(scope): summary [TASK-xxx]`。禁止无 Task 的“顺手重构”和对 `main` 强推。

## 10. Definition of Done

完成前必须：

- 逐条通过 Acceptance Criteria，变更仅在 Allowed Files。
- 通过 Task 指定的 typecheck、lint、unit、contract、build、E2E。
- 覆盖适用的 initial/loading/success/empty/error/partial/retry/reset/第二次操作/切题/timeout/数据不足。
- 浏览器无 console error、hydration warning、明显 layout shift 或请求竞态。
- 完成 1440×900、1366×768、390×844 的浏览器操作与截图；Canvas 有等价 DOM 列表、键盘路径和 Reduced Motion。
- 更新 Task 状态、相关规范与 `verification/TASK-xxx/report.md`；无证据不得标 Done。

核心 P0 额外要求：Snapshot Golden Path、失败恢复、Golden Path 人工 QA 必须 PASS。

## 11. Blocker 规则

先执行 Task 的 Recovery。仍被阻塞时创建 `tasks/blocked/BLOCK-xxx.md`，写明证据、影响、已尝试方案、需要的决定；不得猜测性降级，不得用新的 UI 掩盖失败。

