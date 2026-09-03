# TASK-019 — Backend-ready Honest Demo Closure

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 5h（当前用户授权的收敛任务）
- Freeze deadline: End of current iteration

## Goal

把当前纯 Mock 界面修复为证据可回溯、因果诚实、能通过两条冻结 BFF 接入后端数据，并在桌面与手机端完整走通的 Demo。

## Why in Golden Path

现有流程虽然能从教室走到《我的一席》，但 Candidate 证据、用户回应因果与知乎出口没有真实闭合；同步 Mock 状态也无法安全接入后端。本任务补齐“看懂全班 → 有证据找到位置 → 完成个人表达 → 回到知乎”的可信闭环。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-017 Done；PROP-0004 Accepted；当前用户指令批准吸收 TASK-002/003 中与本 Demo 垂直切片直接相关的子集。
- Inputs: CONTRACT-DOMAIN/API/STATE rc.1、PDR-0004、现有 40 人 Mock Classroom、Demo V3 Narrative。
- Outputs: Candidate/API Contract、Provider Port、Fixture BFF、两条 Route、异步 Candidate 状态、证据 Inspector、Cluster Inspector、诚实 Sample 回应、知乎出口、移动 Bottom Sheet、语义动画与验证报告。

## Scope

- Allowed Files:
  - `src/domain/**`
  - `src/contracts/**`
  - `src/server/**`
  - `src/app/api/**`
  - `src/app/classroom/**`
  - `src/features/classroom/**`
  - `data/fixtures/**`
  - `data/samples/**`
  - `tests/**`
  - `docs/proposals/PROP-0004-backend-ready-demo-closure.md`
  - `docs/contracts/**`、`docs/operations/DEMO_RUNBOOK.md`
  - `tasks/README.md`、本 Task、`verification/TASK-019/**`、`README.md`
- Forbidden Files: dependencies/lockfile、Frozen Design Token 值、真实 secret、`data/snapshots/**` 中的伪 Snapshot、真实 Provider SDK。
- Non-Scope: 第三条 Learning Result API、任意回应 AI 生成、真实知乎/LLM/Embedding 调用、数据库、全局幂等、真实 102/103 教室、重选 Canvas 技术。

## Contracts & Decisions

- PROP-0004：两条 P0 API 不变；V3 Narrative 不伪装 Domain/API；Sample 同桌回应 exact-match。
- CONTRACT-DOMAIN-001 / API-001 / STATE-001 rc.1：补齐 Candidate、Envelope 与 Demo 垂直切片实现，不改变既有字段语义。
- PDR-0004：学习闭环、术语与可信度红线不变。

## States / Events / Guards / Effects / Recovery

- Reflection 内 Candidate request 使用 `idle | analyzing | error | no_candidate | resolved` 判别状态。
- 新提交 abort 旧请求；只接受当前 requestId；Reset abort 并清空 Candidate/Claim/Seat。
- `success + candidateSeats.length > 0` 才进入 Candidate；`partial/no_candidate` 不亮座位。
- Candidate Evidence 必须按 `evidenceId` 解引用；缺失关系阻止显示成功态。
- 同桌回应只有与显式 Sample 精确匹配时才能进入固定课堂笔记与《我的一席》；其他文本保留并提示恢复示例。
- Cluster/Student/Campus/Note 都是正交 Panel，不改变主 Phase；关闭后恢复触发控件焦点。

## Exact UI Copy

- Candidate loading：`正在分析你的观点与当前课堂的关系…`
- Candidate error：`这次分析没有完成，你的输入已经保留。`
- No Candidate：`当前演示分析没有找到可核验的一席。`
- Sample 回应提示：`当前 Demo 只为示例回应准备了后续学习产物；恢复示例后可继续。`
- 知乎出口：`打开知乎，亲自完成回答`
- Mock 来源说明继续显式可见。

## Edge Cases

- Candidate invalid payload、revision mismatch、no_candidate、stale response、retry、reset、第二次完整流程。
- Candidate Evidence 缺 ID/错来源/错 note range 时 schema 失败。
- 非示例同桌回应不得生成固定 After/MySeat/Draft。
- Cluster 缺 representative/evidence 时不显示伪成功内容。
- Clipboard 拒绝时显示可恢复提示；知乎链接保持有效 https URL。
- 390×844 首屏无需页面滚动即可看到足够教室空间和主 CTA；Rail 内部滚动、Footer 固定。
- Reduced Motion 直接显示最终布局；Reset/关闭 Inspector 不重播入场和 Candidate Wow。

## Acceptance Criteria

- [x] A. GET Classroom 与 POST Candidate Route 返回经 Zod 校验的统一 Envelope，mode/provenance 明确。
- [x] B. UI 不直接把 Demo Narrative 的 Candidate 文案当后端分析结果；三项证据均由合法 `evidenceId` 回溯。
- [x] C. Candidate 覆盖 analyzing/error/no_candidate/resolved、stale/retry/reset，成功 guard 保守。
- [x] D. 任意同桌回应不会得到固定学习产物；精确 Sample 可继续完整流程。
- [x] E. 五个观点组均可打开 Cluster Inspector，查看共同理由、边界、代表来源和带证据的示例推演。
- [x] F. 最终出口既能复制提纲，也能通过 https 链接打开知乎；失败有可见反馈。
- [x] G. 首次进入按固定时序表达学生入场/桌组形成；Candidate Reveal 表达 Claim→Seat 因果；Reduced Motion 直接最终态。
- [x] H. 390×844 使用 Bottom Sheet，首屏同时可见教室语义和主 CTA；1440×900、1366×768 无遮挡。
- [x] I. typecheck、lint、unit/contract/integration、build、diff-check 全绿；console/page/hydration error 为 0。
- [x] J. 任务板、Contract/Runbook、README 与 verification report 同步，无 PASS/状态漂移。

## Verification

- Commands: `npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`git diff --check`。
- Browser: 1440×900、1366×768、390×844；Cluster、Candidate success/noCandidate/error/retry、非示例回应、Sample 完整闭环、知乎 href、Reset、Reduced Motion。
- Artifacts: `verification/TASK-019/report.md` + 关键截图。

## Do Not / Rollback / Blocker Rule

不得把 Mock 改名为 Snapshot，不得让任意笔记/回应命中预计算 Sample，不得为动画修改数据坐标或引入循环炫技。Rollback 只回退 TASK-019 允许文件。阻塞按 AGENTS.md §11 记录。

## Docs to Update

`tasks/README.md`、本 Task、相关 Contract、Runbook、README、`verification/TASK-019/report.md`。
