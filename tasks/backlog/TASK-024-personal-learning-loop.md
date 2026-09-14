# TASK-024 — 真实同桌追问与个人学习闭环

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 2h
- Freeze deadline: 见交付计划对应时间门

## Goal

用户自己的观点与回应能够因果一致地生成追问、学习笔记、我的一席与三行提纲。

## Why in Golden Path

落实真实资料到个人表达的闭环；具体范围来自 PROP-0005，禁止越过依赖启动消费者。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-021～023 Done；Learning Result/API/State Contract 已冻结。
- Inputs: 本次 Candidate/观点、真实课堂、学习合同、用户回应。
- Outputs: 一次追问及回应后产物的服务端边界、真实叙事加载、UI/状态接入、去知乎闭环。

## Scope

- Allowed Files: `src/server/pipelines/learning/**`、`src/server/providers/**`、`src/server/prompts/**`、`src/server/use-cases/**`、`src/app/api/v1/learning-turn/**`（以 TASK-021 冻结路由为准，变更先更新 Task）、`src/features/classroom/**`、`src/app/page.tsx`、`src/app/classroom/**`、`tests/**`、本 Task、任务板、`verification/TASK-024/**`。
- Forbidden Files: 密钥、用户真实笔记、既有 Accepted Record 原地改结论、Frozen Design Token 值。
- Non-Scope: 通用自由聊天、多 Agent、长期记忆、数据库、多教室 Live、自动发布知乎回答。

- Allowed Files 补充：`src/domain/schemas/learning-sample.ts`、`scripts/precompute/build-learning-sample.ts`、`data/snapshots/**`（新增版本与 active pin）、`docs/proposals/PROP-0005-real-data-delivery.md`、`docs/decisions/adr/ADR-0011-personal-learning-state.md`、`docs/decisions/INDEX.md`、`docs/contracts/REAL_DELIVERY_CONTRACT.md`、`output/playwright/**`、`.playwright-cli/**`。

## Contracts & Decisions

- 2026-09-15 补充范围：`docs/proposals/PROP-0006-deepseek-pro-recovery.md`、`docs/decisions/adr/ADR-0012-deepseek-pro-recovery.md`；用户明确授权测试并切换 V4 Pro，本机忽略的环境配置可更新，密钥不得进入提交。

PROP-0005、PDR-0004、既有 Domain/API/State 以及 TASK-021 冻结记录。新字段/依赖/目录若不在已定稿范围，先更新 Proposal/Task，不能猜测实现。

## States / Events / Guards / Effects / Recovery

沿既有 V3 phase 添加已冻结学习请求子态；pending 禁止重复推进、error 保留回应、retry、reset、stale、第二次体验。

## Exact UI Copy

课堂归纳不代表知乎立场；追问不冒充真实答主；产物不宣称掌握或全新观点，最终引导用户亲自表达。

## Edge Cases

无匹配同桌、答非所问、回应为空、生成遗漏、未变化的观点、模型编造用户观点、重复提交/重置、不同来源数量。

## Acceptance Criteria

- [x] 至少两组不同的非示例观点/回应得到相应匹配、一次追问及个人产物；相关引用可回溯。
- [x] 回应前后产物不套固定 Scenario；不替用户虚构认知改变，也不生成完整知乎回答。
- [x] 人数/簇数/入席人数、题目链接与当前真实课堂一致；102/103 仍明确预览。
- [x] 完整路径到达提纲、复制与知乎原问题链接，错误/重试/Reset/第二次体验有证据。
- [x] typecheck、lint、test、build 通过；三种视口和 Reduced Motion 无主路径阻断。

## Verification

- Commands: 相关 unit/contract/integration、typecheck、lint、test、build、git diff --check；有 UI 变更时执行浏览器 QA。
- Visual: 1440×900、1366×768、390×844；仅 server/合同阶段在集成发布门统一验证，阶段报告注明未完成项。
- Artifacts: `verification/TASK-024/report.md` 与脱敏验证材料。

## Do Not / Rollback / Blocker Rule

06:30 学习门失败时退至明确示例路径并保留输入；不得把 Live Candidate 接到不匹配的固定后半段。 回退仅限任务范围；运行时不写部署文件系统。Recovery 仍失败时按 AGENTS.md 记录 BLOCK，不能无证据标 Done。

## Docs to Update

本 Task、任务板、相应 Contract/Decision、交付计划、运行说明与 verification report。


验收：`verification/TASK-024/report.md`，63 tests 与三视口 Golden Path PASS。
