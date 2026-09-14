# TASK-020 — 截止前交付审计与执行计划

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 30 分钟
- Freeze deadline: 本轮调研结束

## Goal

在修改业务代码前，确认 Mock Demo 与可提交产品之间的差距，形成按北京时间 2026-09-15 10:00 暂定截止倒排的计划、用户交接清单和赛后 Agent 学习路线。

## Why in Golden Path

防止只替换 Candidate 模型调用，却遗漏真实教室、固定同桌剧本、证据来源和公网提交闭环。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-019 Done；用户本轮明确要求先调研和制定计划。
- Inputs: 仓库实现、Accepted Records、开发者手册链接、nanobot 官方仓库、官方招聘实例。
- Outputs: 交付计划、范围 Proposal、后续分阶段 Task、当前工程验证记录。

## Scope

- Allowed Files: 本 Task、`tasks/README.md`、`tasks/backlog/TASK-021-*.md` 至 `TASK-025-*.md`、`tasks/blocked/BLOCK-001-handbook-access.md`、`docs/operations/SUBMISSION_SPRINT_2026-09-15.md`、`docs/proposals/PROP-0005-real-data-delivery.md`、`verification/TASK-020/**`；2026-09-15 用户后续授权的本机 `.env.local` 与无密钥 `.env.example` 配置。
- Forbidden Files: 业务源码、依赖、锁文件、既有 Accepted Record、任何进入 Git/报告/前端的密钥。
- Non-Scope: 本轮不宣称已接通真实接口、已部署或已提交比赛；后续接入在独立任务中执行。

## Contracts & Decisions

遵守 AGENTS.md、PDR-0004、PROP-0004；保留既有 Mock 演示结果。后续真实学习产物需要新增合同，不能把任意输入套入固定剧本。

## States / Events / Guards / Effects / Recovery

文档/权限无法读取时标为待确认，给出最小信息交接项；时间未确认时按更早的上午 10:00 排程。不绕过登录或猜测 API。

## Exact UI Copy

不涉及产品 UI 修改。

## Edge Cases

上午/晚上截止歧义；手册需登录；权限未开通；现有部署不可见；真实同题召回不足；旧任务状态与实现不同步。

## Acceptance Criteria

- [x] 列出代码证据支持的缺口、依赖、优先级和降级门。
- [x] 交付计划区分已验证事实、估算和未确认比赛规则。
- [x] 明确用户需要提供的最小信息，不要求把密钥贴到聊天。
- [x] 给出 nanobot 学习映射与可诚实写入简历的成果要求。
- [x] 当前 typecheck/lint/test/build 与 API smoke 结果留档。

## Verification

- Commands: typecheck、lint、test、build、生产服务本机 HTTP smoke、git diff --check。
- Visual: 文档任务不修改页面；既有 TASK-019 浏览器记录只作历史证据，不冒充本轮复测。
- Artifacts: `verification/TASK-020/report.md`。

## Do Not / Rollback / Blocker Rule

不改用户已有 AGENTS.md/next-env.d.ts 变更；只回退本任务新增文档。无法读取的外部手册如实标记，不伪造已核验结论。

## Docs to Update

Task Board、交付计划、后续 Task、Proposal、verification report。

## 2026-09-15 配置交接复核

用户提供 DeepSeek 官方 endpoint、deepseek-flash 模型与可用凭证，并确认目前仅本地运行。本次仅保存被 Git 忽略的本机配置、执行最小模型 smoke 和读取 Edge 手册，不启动尚未完成依赖门的业务实现。凭证内容不进入报告。
