---
id: IMP-001
status: Frozen
owner: Lead Product Architect
version: 1.0.0
last_verified: 2026-08-31
depends_on: [PDR-0001, PDR-0002, PDR-0003, ADR-0001, ADR-0002, ADR-0003, ADR-0004]
---

# 《知遇·一席》Implementation Master Plan

本计划把已有 48h 方案收敛为可长期执行的 `Specification → Contract → Task → Implementation → Acceptance → Verification` 系统。它不重选技术栈；只修正会让实现失真、不可验证或在 Vercel 上不可运行的硬伤。

## 0. 审查结论

技术方向可保留，但原计划有五项必须修正：

1. AI SDK 结构化输出冻结为当前主路径 `generateText + Output.object`，业务只依赖 `StructuredOutputProvider`；旧 `generateObject` 不进入业务合同。
2. Vercel 运行时不能把 JSON 写回部署文件系统；Snapshot 是预计算后提交仓库/对象存储的只读资产。
3. “笔记中写过”不能证明“掌握”；V1 只说“来自你的笔记/笔记有明确表达”。
4. LLM 只能返回 `evidenceId`，引文由服务端从已验证摘要或笔记区间解析。
5. 同题 20–30 条回答摘要的稳定召回尚未闭环，必须经过 API 验证门；失败时只承诺“官方搜索召回并人工核验的同题样本”。

## 1. Product Definition

把“别人怎么想”空间化，把“我的知识可能出现在哪里”可视化。用户不是来获得一个 AI 答案，而是理解当前讨论结构，并找到一个有证据、有限定条件的贡献位置。

## 2. Product Principles

1. Conceptual Wow > Visual Wow：动画必须解释观点为何聚拢、个人视角为何入场。
2. Evidence before assertion：无法回溯的判断不展示。
3. Conservative by default：不确定不生成 Candidate Seat，弱分歧不硬拆阵营。
4. One Golden Path：第一版只做一条高完成度垂直切片。
5. Human authorship：AI 帮用户看见结构，不代写完整回答。
6. Honest fallback：Live、Snapshot、Sample、Mock 永不静默混淆。

## 3. Golden Path

首页唯一主 CTA进入备案教室 → 学生入场并形成观点簇 → 查看一个学生 → 查看一个簇及预设对峙/拒答 → 在教室内带入笔记 → 运行 Claim 分析 → Candidate Seat 在原空间出现 → 核验“相关 / 来自笔记 / 当前覆盖较少” → 揭示三行提纲 → 跳转知乎问题页。

详见 `docs/experience/UX_SPEC.md`。独立结果页、功能菜单、同权入口均不进入 V1。

## 4. Experience Architecture

价值按时序逐步揭示：第一秒理解“问题是一间教室”，第三秒理解“回答按论证坐在一起”；探索后才解释“AI 归纳”；用户主动带入笔记后才出现 Candidate Seat；三栏证据确认后，闭环 CTA 才成为视觉主位。后台若无真实阶段事件，只显示 `analyzing`，不伪造 extracting/matching/judging 进度。

## 5. Information Architecture

V1 只有两级：`/` 首页与 `/classroom/[questionId]` 教室。学生详情、簇详情、笔记编辑、证据、提纲均以同页 Sheet/Inspector 呈现，保证空间上下文不断裂。API 只保留 `/api/v1/classrooms/:questionId` 与 `/api/v1/candidate-seat` 两个 P0 边界。

## 6. State Model

Classroom 与 Candidate Seat 使用两个正交状态机；选择态是 `ready.selection` 的子状态，不与加载阶段并列。所有请求携带 `requestId`、AbortSignal；切题/重复提交丢弃 stale response。`partial`、`no_candidate` 是合法业务结果，不是异常。

详见 `docs/contracts/STATE_MACHINES.md`。

## 7. Design Philosophy

视觉人格是“由真实观点形成的动态认知教室”：暖纸背景、墨色信息、低饱和等权观点色、唯一琥珀色 Candidate Seat。页面主体是一块连续舞台，不是 Dashboard，不做 Card 套 Card、玻璃拟态、发光墙、无意义渐变和装饰性粒子。

## 8. Design System 建立方法

Tokens 先于组件，组件先于页面。颜色、字级、间距、圆角、阴影、动效、层级和响应式阈值集中冻结在 `docs/design/DESIGN_SYSTEM.md`，实现后映射到 CSS variables。Design Token 改动必须新 UXDR/Proposal；实现 Agent 不得“顺手优化审美”。

## 9. Core Component Model

`ClassroomStage` 持有空间；`ForceGraphAdapter` 隔离第三方 Canvas；`StudentInspector`、`ClusterInspector`、`NoteComposer`、`CandidateEvidenceInspector`、`OutlineReveal` 是单一职责消费者。页面只编排，不承载算法/Provider。Canvas 外必须有可访问的 `ArgumentList`。

## 10. Motion Principles

允许：学生入场、观点聚拢、选择、Claim 入场、空桌一次亮起。禁止：无限呼吸、背景粒子、按钮漂浮、与数据无关的炫技。Reduced Motion 直接展示最终布局；备案 Snapshot 固定 seed/坐标，确保截图和录屏可复现。

## 11. Data Architecture

数据流：知乎官方搜索摘要 → `SourceContent` → `Evidence` → `ArgumentDraft` 校验 → `Argument` → Embedding → Agglomerative cluster → `ClassroomSnapshot`。运行时笔记 → `Claim` → relevance/noteSupport/coverage → `AnalysisResult` → `CandidateSeat`。所有跨边界对象通过 Zod 解析并带 `schemaVersion`。

## 12. Domain Schema

冻结实体：Question、SourceContent、Evidence、Argument、Student、Cluster、ClusterRepresentative、Claim、ClaimAssessment、CandidateSeat、AnalysisResult、Classroom、SnapshotManifest、ApiEnvelope。LLM Draft 与最终 Domain Entity 分离；Embedding 不下发浏览器；ID 使用稳定前缀。

详见 `docs/contracts/DOMAIN_CONTRACT.md`。

## 13. Technical Architecture

Next.js App Router 单体负责 UI 与 Backend-for-Frontend；Domain/Contract 可安全跨端共享；Provider、Prompt、Secret 与 Pipeline 仅在 server。完整建室由 `scripts/precompute` 执行，不塞进同步 Route Handler。react-force-graph 使用 client-only Adapter，保留裸 d3-force/G6 的验证门，不提前双实现。

## 14. AI / LLM Architecture

LLM 只用于 Argument/Claim Draft、簇中性标签、覆盖三档判断与三行提纲；领域规则、证据校验、Candidate guard、分母和 provenance 都是确定性代码。Structured output 失败有限重试，仍失败返回 typed error/partial，不吞错。

## 15. Provider Abstraction

最小 Port：`ContentProvider`、`EmbeddingProvider`、`StructuredOutputProvider`、`ClassroomSource`、`CandidateSeatAnalyzer`。业务 Pipeline 持有 Prompt 与领域语义；Provider 只做外部能力适配、timeout/retry/rate-limit mapping 和 Zod validation。

## 16. Snapshot / Mock Strategy

Snapshot 是真实历史资产；Mock 是测试合成数据；Sample 是显式示例笔记。Snapshot 不覆盖更新，每次生成新 ID 与 manifest。Classroom 可自动回退同题 Snapshot；任意笔记 Candidate 不得伪回退，只有精确 sample/hash 命中才能用预计算结果。

## 17. Project Directory Structure

```text
src/app                 # 路由与页面编排
src/features            # classroom / candidate-seat UI 与 machine
src/domain              # Zod schema、规则、纯类型
src/contracts           # API request/response/error
src/server/ports        # Provider interfaces
src/server/providers    # zhihu / ai-sdk / embedding / snapshot
src/server/pipelines    # classroom / candidate-seat use cases
src/server/prompts      # 版本化 Prompt
data/snapshots          # 不可变 Demo 资产
data/samples            # 明示样例
scripts/precompute      # 赛前生成
tests                   # unit/contract/integration/e2e/visual
docs / tasks / verification
```

禁止无边界 `utils/` 和几十层 Clean Architecture 空壳。

## 18. Coding Conventions

TypeScript strict；Zod 是运行时真相，类型从 schema infer；错误使用稳定 code；函数和模块以领域行为命名。Server module 不得被 Client import。日志不记录笔记正文，只记录长度、hash、requestId。常量进入 domain policy，不散落组件。任何随机布局必须可注入 seed。

## 19. Agent Development Protocol

遵守 `AGENTS.md`：先读规范与 Task；Frozen 变更先 Proposal；只改 Allowed Files；先 fixture/contract test 后最小实现；完成后提交验证证据。多 Agent 一 Task 一 owner，一 worktree/branch；共享 contract 先冻结。

## 20. ADR / Decision Record Strategy

Architecture、Product、UX 分别使用 ADR/PDR/UXDR。Accepted Record 不改结论，只能由新 Record supersede。所有替代技术必须按 Problem/Evidence/Impact/Alternative/Migration Cost/Recommendation 评估，禁止以“更现代”为理由换栈。

## 21. Git / Branch / Commit Strategy

短分支 trunk-based，`main` 始终可部署。Task 分支 `task/TASK-xxx-*`；原子提交 `type(scope): summary [TASK-xxx]`。PR/交接必须列 Task、Contract/Decision、AC、验证、截图与回滚。Freeze 打 tag：`freeze/schema-h2`、`freeze/demo-h24`、`demo-submission`。

## 22. Task Model

每项 Task 必须包含 Goal、Golden Path Context、Dependencies、Inputs/Outputs、Allowed/Forbidden Files、Contracts、States、Edge Cases、AC、Verification、Visual Verification、Non-Scope、Do Not、Rollback、Docs Update。建议 2–5h、一个可演示结果、最多一个核心合同 owner。

## 23. Task Dependency Graph

```text
TASK-001 Repo/Next/CI
 ├─ TASK-002 Domain schemas + fixtures
 └─ TASK-003 Provider + provenance
TASK-002 + 003 → TASK-004 一题 Search→Argument 验证门
TASK-004 → TASK-005 Embedding→Cluster→Snapshot
TASK-002 + 005 → TASK-006 Classroom Stage
TASK-006 → TASK-007 Student/Cluster Inspector
TASK-002 + 003 → TASK-008 Note→Claims
TASK-005 + 008 → TASK-009 Candidate Seat + Evidence
TASK-006 + 007 + 009 → TASK-010 Snapshot Golden Path
TASK-010 → TASK-011 Seat Motion + Outline + Zhihu CTA
TASK-011 → TASK-012 Reliability + Visual/Golden/Red-team QA
```

## 24. Definition of Done

“页面能打开”不算完成。所有 Task 必须通过 AC、strict typecheck、lint、unit、contract、build；适用时覆盖 empty/loading/error/partial/retry/reset/第二次操作/切题/timeout；无 console/hydration/layout/竞态问题；完成键盘、焦点、Reduced Motion 与三视口 QA；附 verification report。

## 25. Testing Strategy

从内到外：Schema/关系完整性 contract test → Candidate/Cluster 纯规则 unit → Provider contract → State transition table → Route integration → Prompt eval → Snapshot E2E → 浏览器 Visual → opt-in Live smoke。普通 CI 永不消耗真实知乎/LLM 额度。

## 26. Visual QA

固定 Snapshot、seed、时间和动画状态。矩阵至少覆盖 1440×900、1366×768、390×844；首屏、ready、学生、簇、loading、empty、error、partial、noCandidate、Candidate、提纲。Canvas 专检热区、重叠、离群点、缩放恢复、DOM 替代与 Reduced Motion。

## 27. Golden Path QA

GP-001 Snapshot 是发布阻断项，必须 100% PASS；Live 可因凭证阻塞，但至少留一次真实 smoke 记录。第二次提交、切题清理、Retry、Reset、跑题、高重复、部分重叠、数据不足和断网回退均属于 P0 QA。

## 28. Error / Failure / Recovery

Classroom Live timeout → 同题 Snapshot + 显式披露；Snapshot 校验失败 → 阻止渲染；Candidate Live 失败 → 保留笔记，Retry/Use Sample；部分 Claim 失败 → partial；证据无法回溯 → inconclusive；Canvas 失败 → DOM 列表。任何 `uncertain` 不得生成座位。

## 29. Demo Safety Layer

默认 Demo 是完整 Snapshot Vertical Slice；Live Preview 是显式增强，UI 标“未校准快速预览”。Snapshot 显示“数据快照 · 抓取于 …”。模式切换不改变 DOM 结构和交互。备案题、示例笔记、Candidate、提纲均有完整预计算资产与校验和。

## 30. Freeze Strategy

- 赛前/H0：Product、Golden Path、P0、文案红线 Freeze。
- H2：Schema/API/Snapshot Contract Freeze。
- H5：Provider/Pipeline/Cluster output Freeze。
- H8：UX/Core Layout/Design Token/Motion semantics Freeze。
- H24：Demo Freeze，停止新增 Feature。
- H38：Demo 数据与文案 Freeze。
- H44：Code Freeze，只修 P0 blocker。

例外必须写 `FREEZE-EXCEPTION`：证据、最小改动、影响、回滚、owner。

## 31. Development Phases

Phase A 规格与合同 → Phase B 一题数据验证 → Phase C Snapshot Classroom 垂直切片 → Phase D Candidate Seat → Phase E Golden Path 集成 → Phase F 视觉/可靠性/路演。任何阶段不满足 Exit Criteria，不平铺下一层 Feature。

## 32. 48h Implementation Order

沿用原计划 H0–H47，但前移 Design Token/舞台布局到 H5 前；H35–H38 只做 QA 和微调。H13 静态课代表未完成则永久放弃聊天；H19 Candidate 单题未跑通则切示例笔记+预计算结果；H24 后所有 Feature Request 进入 Deferred。

## 33. Scope Reduction Rules

固定顺序：MCP → 任意题 Live → 课代表真聊天 → 阿问 → 装饰动画 → 动态提纲改确定性三行模板 → 通用 Candidate 改显式示例。永不砍：可解释分群、Candidate 三项证据、来源/分母/AI 归纳披露、教室内出现的一席、去知乎闭环、Snapshot Golden Path。

## 34. Known Risks

最高风险：同题样本召回不足、摘要误称全文、聚类距离/Linkage 不匹配、引文幻觉、笔记隐私披露、Live 与 Snapshot 混淆、Canvas 可访问性与录屏漂移、Candidate 过度推断、首次联调超时。风险 owner、触发条件与恢复动作见 Runbook。

## 35. Red-Team Checklist

- 弱分歧题是否硬造三派？离群点是否被吞？
- 跑题/重复/部分重叠是否分别得到 noCandidate/covered/partial？
- 每条引文是否真能回溯 evidenceId？
- 分母是否按去重 sourceId 计算，而非原始结果数？
- 搜索摘要是否被错误称作全文？
- Live 失败是否诚实显示 Snapshot？任意笔记是否被伪回退？
- 课代表是否冒充答主/自由聊天？聚类是否暗示正确性？
- 第二次提交、切题、Retry、Reset 是否污染状态？
- 断网、限流、超时、少数据、Canvas 失败是否有可操作恢复？
- 两分钟脚本是否在第一分钟展示概念价值，而非纯动画？

## 验收本阶段

本阶段完成的标准不是业务页面数量，而是：一个能力普通的 Agent 能通过 `AGENTS.md + docs + TASK-xxx` 找到唯一真相源，知道能改什么、不能发明什么、如何处理失败，以及用什么证据证明完成。

