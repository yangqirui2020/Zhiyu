# TASK-016 — Interaction and Classroom Layout Hotfix

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 3h
- Freeze deadline: End of current iteration

## Goal

修复 TASK-015 复验发现的交互与视觉回归：黑板不得遮挡学生/桌组，Reduced Motion 直接结束圆桌，Candidate 步骤条准确表示当前阶段，并让状态机与浏览器 QA 可重复验证。

## Why in Golden Path

这些问题会让用户看不清教室空间，或让界面展示一个尚未发生的步骤；它们直接破坏“看懂全班 → 黑板三项 → 找到我的一席”的因果链。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-015 implementation commit `f1cbcfe`；PDR-0004 Accepted。
- Inputs: TASK-015 review evidence、1366×768 与 390×844 遮挡复现、现有 V3 Mock fixture。
- Outputs: 黑板安全取景、Reduced Motion 自动收束、准确步骤条、Session reducer 单测、可失败的 QA、TASK-016 验证报告。

## Scope

- Allowed Files:
  - `src/features/classroom/ClassroomExperience.tsx`
  - `src/features/classroom/ForceGraphAdapter.tsx`
  - `src/features/classroom/ForceGraphCanvas.tsx`
  - `src/features/classroom/classroom.module.css`
  - `src/features/classroom/session-machine.ts`
  - `tests/unit/session-machine.test.ts`
  - `package.json`
  - `verification/TASK-015/qa-v3.cjs`
  - `verification/TASK-016/**`
  - `tasks/README.md`
  - 本 Task 文件
- Forbidden Files: `src/domain/**`、`src/contracts/**`、`src/server/**`、fixtures、dependencies/lockfile、Frozen Design Token 值、Golden Path 文案。
- Non-Scope: 新功能、真实 Provider、多教室数据、视觉风格重做、Schema/API/状态相位增删。

## Contracts & Decisions

- `docs/contracts/STATE_MACHINES.md` rc.1：不修改合同，仅测试现有 V3 session reducer 的相位 guard。
- `docs/design/DESIGN_SYSTEM.md` v1.0.0：不改 Token 或核心布局，只消除覆盖和错误阶段反馈。
- `docs/decisions/pdr/PDR-0004-demo-v3-learning-loop.md`：Golden Path 与术语不变。

## States / Events / Guards / Effects / Recovery

- `roundtable`：普通动效按既有时序推进；Reduced Motion 在开始后直接触发 `roundtable_finish`。
- Candidate Story：当前相位只高亮已经发生的对应步骤，不提前显示下一步。
- `reset`：仍恢复 `initialSessionState`；第二次流程与第一次一致。
- 学生详情与校园 panel 继续保持正交，不改变当前 phase。

## Exact UI Copy

沿用 TASK-015 固定文案，不新增产品措辞。

## Edge Cases

- 黑板从问题态增高到三项结论态时重新取景。
- Candidate 锚点与黑板安全锚点同时存在。
- 1440×900、1366×768、390×844 均不得遮挡学生或步骤条。
- Reduced Motion 不依赖用户点击“跳过”。
- 非示例观点、空回应、非法 reducer event、reset、第二次流程保持原 guard。

## Acceptance Criteria

- [x] A. 1440×900、1366×768、390×844 的 exploring/reflection/candidate 状态中，黑板、步骤条与学生/桌组无视觉覆盖。
- [x] B. `prefers-reduced-motion: reduce` 下点击圆桌入口后自动进入 reflection，无需等待五句或点击跳过。
- [x] C. Candidate 相位高亮“01 空位亮起”，Seatmate 高亮“02”，Challenge 高亮“03”，MySeat 高亮“04”。
- [x] D. Session reducer 测试覆盖合法路径、非法跳转、空输入、panel 正交、reset、第二次流程。
- [x] E. QA 对 console error/page error 均返回失败，lint 不再因 QA 文件失败。
- [x] F. typecheck、lint、unit/contract、build、diff-check 全绿；Golden Path、102 出口、reset 与第二次操作浏览器复验通过。

## Verification

- Commands: `npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`git diff --check`。
- Visual: 1440×900、1366×768、390×844；exploring、reflection、candidate、Reduced Motion、seated/reset。
- Artifacts: `verification/TASK-016/report.md` + `verification/TASK-016/shots/**`。

## Do Not / Rollback / Blocker Rule

Do not 修改 fixture 坐标、Domain/API Contract、核心 Tokens 或 Golden Path。Rollback 仅回退本 Task 的允许文件。若无法在不改依赖的前提下提供跨机器自动浏览器脚本，则保留 Codex Browser 人工复验并如实记录限制，不伪造自动化通过。

## Docs to Update

`tasks/README.md`、本 Task、`verification/TASK-016/report.md`。
