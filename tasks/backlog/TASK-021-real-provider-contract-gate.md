# TASK-021 — 真实 Provider、Snapshot 与学习结果合同验证门

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 1h（截止前契约验证门）
- Freeze deadline: 见交付计划对应时间门

## Goal

冻结后续消费者可共同验证的最小合同，完成真实接口 smoke，不把手册未知项写成事实。

## Why in Golden Path

落实真实资料到个人表达的闭环；具体范围来自 PROP-0005，禁止越过依赖启动消费者。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-020 Done；开发者手册关键内容与可用服务配置；PROP-0005 具体方案定稿。
- 2026-09-15 01:06：手册、DeepSeek 实测、知乎鉴权/实际额度已取得；按 ADR-0005 先实施 021A 的服务端模型与官方回答传输适配。Embedding、Manifest、Learning 子合同继续验证，本任务全部验收前不启动下游消费者。
- Inputs: 官方请求/响应示例、凭证、已有 Zod Schema、V3 学习主线。
- Outputs: Content/Embedding/StructuredOutput Ports、Manifest/学习结果 Zod 合同、版本化适配决策、通过校验的非敏感样例。

## Scope

- Allowed Files: `src/domain/**`、`src/contracts/**`、`src/server/ports/**`、`src/server/providers/**`、`src/server/errors/**`、`tests/contract/**`、`tests/integration/**`、`.env.example`、`package.json`、`package-lock.json`、`docs/contracts/**`、`docs/architecture/**`、`docs/decisions/**`、PROP-0005、本 Task、任务板、`verification/TASK-021/**`。
- Forbidden Files: 密钥、用户真实笔记、既有 Accepted Record 原地改结论、Frozen Design Token 值。
- Non-Scope: 通用自由聊天、多 Agent、长期记忆、数据库、多教室 Live、自动发布知乎回答。
- Allowed Files 补充：`docs/operations/SUBMISSION_SPRINT_2026-09-15.md`、`tasks/blocked/BLOCK-001-handbook-access.md`，仅同步本次官方验证结果。
- 依赖澄清文档可修改 TASK-022/023：仅调整 Sample 结果生成的执行阶段，最终验收不变。

## Contracts & Decisions

PROP-0005、PDR-0004、既有 Domain/API/State 以及 TASK-021 冻结记录。新字段/依赖/目录若不在已定稿范围，先更新 Proposal/Task，不能猜测实现。

## States / Events / Guards / Effects / Recovery

定义 learning idle/loading/success/error/partial/retry/reset 与旧响应失效条件；所有工具/模型调用有截止时间、AbortSignal、受限重试。

## Exact UI Copy

本阶段不改产品 UI；冻结后续需要的实际服务披露和学习错误恢复文本。

## Edge Cases

401/403、429、超时、畸形结构化输出、不合法 evidenceId、无可用 Embedding、同 idempotencyKey 不同输入。

## Acceptance Criteria

- [x] 官方数据/模型/Embedding 最小请求实测并保留脱敏证据；不输出 Secret。
- [x] Manifest 包含来源、查询、版本、真实数量与 checksum；最低有效样本数经真实资料校准并记录决定。
- [x] 学习请求明确区分一次追问与回应后生成；产物只引用当前 classroom revision、已校验证据和当前输入。
- [x] 本次新增依赖用途/版本/兼容性有记录；相关旧冻结结论的变更用新 Decision Record。
- [x] 合同测试覆盖非法关系/输出；typecheck、lint、41 tests、build PASS。

完成证据：verification/TASK-021/report.md。UI/完整 Golden Path 不是本合同阶段的完成声明，由下游发布门验收。

## Verification

- Commands: 相关 unit/contract/integration、typecheck、lint、test、build、git diff --check；有 UI 变更时执行浏览器 QA。
- Visual: 1440×900、1366×768、390×844；仅 server/合同阶段在集成发布门统一验证，阶段报告注明未完成项。
- Artifacts: `verification/TASK-021/report.md` 与脱敏验证材料。

## Do Not / Rollback / Blocker Rule

接口/权限不可用时执行手册允许的恢复；没有真实资料不进入 TASK-022；新合同不完整不进入 TASK-023/024。 回退仅限任务范围；运行时不写部署文件系统。Recovery 仍失败时按 AGENTS.md 记录 BLOCK，不能无证据标 Done。

## Docs to Update

本 Task、任务板、相应 Contract/Decision、交付计划、运行说明与 verification report。
