# TASK-023 — 真实个人观点 Candidate 分析

- Status: Planned
- Owner: Primary Agent (Codex)
- Estimate: 2h
- Freeze deadline: 见交付计划对应时间门

## Goal

用户自己的观点得到受证据约束的 Candidate/partial/no_candidate 结果，错误保留输入。

## Why in Golden Path

落实真实资料到个人表达的闭环；具体范围来自 PROP-0005，禁止越过依赖启动消费者。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-021、TASK-022 Done。
- Inputs: 合法真实课堂、结构化模型服务、Embedding 粗筛与样例资产。
- Outputs: Candidate Pipeline、真实 Analyzer、模式和回退处理、接入后的 Candidate UI。

## Scope

- Allowed Files: `src/server/pipelines/candidate-seat/**`、`src/server/prompts/**`、`src/server/providers/**`、`src/server/use-cases/analyze-candidate-seat.ts`、`src/app/api/v1/candidate-seat/**`、`src/features/classroom/ClassroomExperience.tsx`、`src/features/classroom/ClassroomContextRail.tsx`、`src/features/classroom/session-machine.ts`、`tests/**`、本 Task、任务板、`verification/TASK-023/**`。
- Forbidden Files: 密钥、用户真实笔记、既有 Accepted Record 原地改结论、Frozen Design Token 值。
- Non-Scope: 通用自由聊天、多 Agent、长期记忆、数据库、多教室 Live、自动发布知乎回答。

## Contracts & Decisions

PROP-0005、PDR-0004、既有 Domain/API/State 以及 TASK-021 冻结记录。新字段/依赖/目录若不在已定稿范围，先更新 Proposal/Task，不能猜测实现。

## States / Events / Guards / Effects / Recovery

idle/analyzing/error/no_candidate/resolved；new request/reset 取消旧请求，revision/requestId 失效丢弃；partial 不强亮座。

## Exact UI Copy

使用合同既有三项证据措辞；按 TASK-021 冻结文本披露实际第三方处理与数据/分析模式。

## Edge Cases

跑题、重复、部分覆盖、无支持、未知证据、笔记切片不一致、超时/限流、第二次提交、重复 key 与输入不一致。

## Acceptance Criteria

- [ ] 至少一条非示例观点经真实模型分析，结果依赖当前输入；模型只返回 evidenceId，最终引用从服务端解析。
- [ ] related AND supported AND limited 唯一亮座条件，uncertain 不亮座；no_candidate 是正常结果。
- [ ] 真实模型失败保留输入并可 Retry；Sample/hash 不匹配不得预计算回退。
- [ ] 实际 mode/provenance 下发并显示；不再按是否携带 sampleId 猜测实时调用模式。
- [ ] 校验/失败用例、测试、构建和关键浏览器操作有证据；不记录笔记正文。

## Verification

- Commands: 相关 unit/contract/integration、typecheck、lint、test、build、git diff --check；有 UI 变更时执行浏览器 QA。
- Visual: 1440×900、1366×768、390×844；仅 server/合同阶段在集成发布门统一验证，阶段报告注明未完成项。
- Artifacts: `verification/TASK-023/report.md` 与脱敏验证材料。

## Do Not / Rollback / Blocker Rule

05:00 仍不稳定时保留真实 Snapshot/精确 Sample，标明通用输入能力边界；不得包装为已完成自由输入闭环。 回退仅限任务范围；运行时不写部署文件系统。Recovery 仍失败时按 AGENTS.md 记录 BLOCK，不能无证据标 Done。

## Docs to Update

本 Task、任务板、相应 Contract/Decision、交付计划、运行说明与 verification report。

