# TASK-022 — 一题真实知乎 Classroom Snapshot

- Status: Planned
- Owner: Primary Agent (Codex)
- Estimate: 2h
- Freeze deadline: 见交付计划对应时间门

## Goal

加载一间由真实同题来源组成、能够核验来源和预计算过程的课堂。

## Why in Golden Path

落实真实资料到个人表达的闭环；具体范围来自 PROP-0005，禁止越过依赖启动消费者。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-021 Done；官方 API 或主办方明确授权数据资产可用。
- Inputs: 冻结 Ports/Manifest、一题官方来源、可用模型与 Embedding。
- Outputs: 预计算脚本、sources/evidence/arguments/cluster/叙事资产、不可变 Snapshot、明确示例笔记；Sample Candidate 结果由依赖本任务的 TASK-023 使用真实 Analyzer 生成后发布新资产版本。

## Scope

- Allowed Files: `scripts/precompute/**`、`scripts/validate-snapshots/**`、`src/server/pipelines/classroom/**`、`src/server/providers/snapshot/**`、`src/server/use-cases/load-classroom.ts`、`src/server/use-cases/load-demo-narrative.ts`、`data/snapshots/**`、`data/samples/**`、`tests/**`、本 Task、任务板、`verification/TASK-022/**`。
- Forbidden Files: 密钥、用户真实笔记、既有 Accepted Record 原地改结论、Frozen Design Token 值。
- Non-Scope: 通用自由聊天、多 Agent、长期记忆、数据库、多教室 Live、自动发布知乎回答。

## Contracts & Decisions

PROP-0005、PDR-0004、既有 Domain/API/State 以及 TASK-021 冻结记录。新字段/依赖/目录若不在已定稿范围，先更新 Proposal/Task，不能猜测实现。

## States / Events / Guards / Effects / Recovery

加载合法 Snapshot 成功；缺数据/错 checksum/错引用阻止渲染；只回退同题合法资产；Snapshot 运行时只读。

## Exact UI Copy

来源为搜索摘要时标“搜索摘要片段”；数量按去重结果，展示真实抓取时间与预计算模式。

## Edge Cases

多题混入、重复回答、短摘要、无效原链、来源不足、一大簇/独立观点、模型标签无依据、配对示例不匹配。

## Acceptance Criteria

- [ ] 每条 source 的问题关联、externalId、URL 和内容类型可核验；不抓取网页或凑满 40 位学生。
- [ ] 聚类输入为论证；归一化、距离与 linkage 相容，人数/簇数不硬设。
- [ ] 所有引文从服务端已存材料解引用；黑板/圆桌引用绑定同一 Snapshot。
- [ ] Manifest/schema/checksum/跨引用验证 PASS；重复执行生成新版本且可复现选定资产。
- [ ] 真实资产可被加载；明确 Sample 输入与真实课堂绑定，保底 Candidate 结果由 TASK-023 产出并在最终 Golden Path 验收；未把 Mock 改名 Snapshot。

## Verification

- Commands: 相关 unit/contract/integration、typecheck、lint、test、build、git diff --check；有 UI 变更时执行浏览器 QA。
- Visual: 1440×900、1366×768、390×844；仅 server/合同阶段在集成发布门统一验证，阶段报告注明未完成项。
- Artifacts: `verification/TASK-022/report.md` 与脱敏验证材料。

## Do Not / Rollback / Blocker Rule

按冲刺计划 03:00 数据门决定保留备案题或材料不足；没有满足合同的来源不得进入真实课堂消费者。 回退仅限任务范围；运行时不写部署文件系统。Recovery 仍失败时按 AGENTS.md 记录 BLOCK，不能无证据标 Done。

## Docs to Update

本 Task、任务板、相应 Contract/Decision、交付计划、运行说明与 verification report。
