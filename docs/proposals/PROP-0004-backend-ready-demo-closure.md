# PROP-0004 — Backend-ready Honest Demo Closure

- Status: Accepted
- Decision owner: Current user instruction
- Date: 2026-09-02

## Problem

Demo V3 已能演示一条完整界面流程，但 Classroom 与 Candidate 仍直接读取客户端 Mock fixture；Candidate 三项依据没有 `evidenceId` 回溯；任意同桌回应会得到固定课堂笔记与《我的一席》；最终出口只复制提纲而不打开知乎；Cluster Inspector、真实请求状态、移动端 Bottom Sheet 与概念性入场动画仍缺失。

## Evidence

- `/classroom/[questionId]` 直接 import Mock Classroom 与 Demo Scenario，并只生成一个静态参数。
- `src/app/api`、`src/contracts`、`src/server` 与 Candidate/Analysis Zod Schema 不存在。
- `submit_opinion` 同步进入 Candidate，相位无法表达 analyzing/error/no_candidate/retry/stale response。
- Candidate UI 读取 `scenario.candidate.evidence` 展示自由文案，不能解析到来源或笔记区间。
- Challenge 接受任意文本，但 `classNote.after`、`mySeat` 与 `zhihuDraft` 始终来自固定 Scenario。
- Canvas 从首次绘制起使用最终 `fx/fy`，移动端 Context Rail 排在 560px Canvas 之后。

## Impact

- 保留冻结的两个 P0 API：`GET /api/v1/classrooms/:questionId` 与 `POST /api/v1/candidate-seat`，不增加 Learning Result 接口。
- 补齐 Candidate/Analysis/API Zod Contract、Provider Port、fixture-backed BFF 与显式 mode/provenance；真实 Provider 后续只替换 Adapter。
- V3 圆桌、黑板、同桌、课堂笔记与校园入口继续作为 feature-local、显式 Mock Narrative，不伪装成后端 Domain 结果。
- Candidate 三项证据改为从 `AnalysisResult` 的 `evidenceId` 解析；任意同桌回应不再触发固定学习产物。
- 补齐 Cluster Inspector、知乎外链、异步/失败恢复、移动 Bottom Sheet 与一次性语义动画。

## Alternatives (include keep current)

- 保持当前纯 Mock：无法形成可信闭环，也不能在不重写状态机的情况下接入后端。
- 新增 `/api/v1/learning-result`：可支持任意回应动态生成学习产物，但会扩大 Frozen P0 API、Prompt 与隐私范围，本轮不采用。
- 把完整 Demo Scenario 塞入 Classroom/AnalysisResult：会混淆 Domain Evidence 与演示叙事，本轮不采用。
- 先只美化动画：不能解决虚假因果、证据与后端边界问题。

## Migration Cost

新增 Contract、Port、Use Case、Fixture Adapter、Route Handler 与测试；Classroom 页面改为经 server use case 加载；Candidate 流程改为真实 fetch 状态。现有 40 人 Mock、坐标、Design Token、两条 API 名称与 Golden Path 不变。无数据库时 idempotency 只提供单实例 best-effort，不宣称全局保证。

## Recommendation

以一个收敛 Task 完成最小垂直闭环。该 Task 在当前用户明确授权下吸收 TASK-002/003 与本 Demo 直接相关的 Contract/Provider 子集；完整 Snapshot checksum、真实 Zhihu/LLM/Embedding Provider 与任意回应 Learning Result 仍保留在原任务/后续 Proposal，不用 Mock 冒充完成。

## Affected Files / Contracts / Tasks

- `src/domain/schemas/**`、`src/domain/rules/**`
- `src/contracts/**`、`src/server/**`
- `src/app/api/**`、`src/app/classroom/**`
- `src/features/classroom/**`
- `data/fixtures/**`、`data/samples/**`
- `tests/**`、`docs/contracts/**`、`docs/operations/**`
- `tasks/README.md`、`tasks/active/TASK-019-backend-ready-demo-closure.md`
- `verification/TASK-019/**`

## Rollback

回退 TASK-019 的新增 Contract/Server/API 文件与 Classroom feature 接线，即恢复 TASK-017 的纯 Mock Demo；不修改或伪造 `data/snapshots`。

## Decision Owner / Deadline

当前用户在 2026-09-02 明确要求修复 review 中的问题并允许 subagent 协作；本 Proposal 随该指令 Accepted，在当前迭代完成。
