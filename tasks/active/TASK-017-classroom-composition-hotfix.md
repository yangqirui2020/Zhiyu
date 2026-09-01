# TASK-017 — Classroom Composition Hotfix

- Status: Done
- Owner: Primary Agent (Codex)
- Estimate: 2h
- Freeze deadline: End of current iteration

## Goal

修正当前 Demo 的课堂构图：桌组整体更靠近黑板、底部与左下控件保持安全距离、移除无解释的讲台/虚线路径装饰，并让走廊入口及 101–103 门牌顺序清晰。

## Why in Golden Path

首屏必须先读成一间协调、可理解的教室。桌组贴底、装饰含义不明和入口方向含混会在用户开始探索前破坏空间隐喻。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-016 Done；`PROP-0003` Accepted。
- Inputs: 用户提供的 2026-09-01 首屏截图、当前 V3 Mock Classroom。
- Outputs: 收紧后的稳定取景、无碰撞左下桌组、简化动线、清晰走廊标记与三列门牌。

## Scope

- Allowed Files:
  - `src/features/classroom/ForceGraphCanvas.tsx`
  - `src/features/classroom/ClassroomExperience.tsx`
  - `src/features/classroom/classroom.module.css`
  - `tasks/README.md`
  - 本 Task 文件
  - `verification/TASK-017/**`
- Forbidden Files: `src/domain/**`、`src/contracts/**`、`src/server/**`、fixtures、依赖与 lockfile、Design Token 值、Golden Path 状态与文案。
- Non-Scope: 新功能、真实多教室数据、Canvas 方案替换、角色重画、Candidate/Session 行为改动。

## Contracts & Decisions

- `docs/design/DESIGN_SYSTEM.md` v1.0.0：保持课堂为连续空间，Token 不变。
- `docs/proposals/PROP-0003-pixel-classroom-world.md`：只修 Experience/Visual/Spatial 层。
- 不修改 Domain/API/State Contract。

## States / Events / Guards / Effects / Recovery

- 所有相位共享相同安全取景；reflection 黑板增高和 Candidate 出现时仍重新 fit。
- 学生选择、圆桌、Candidate、Reset 与校园 panel 行为不变。
- 浏览器缩放与不同视口下，底部安全锚点继续参与取景。

## Exact UI Copy

- 教室内右下门标由“走廊入口 / 1F →”改为“通往走廊 / 1F →”，明确这是从教室去往走廊的方向。
- 顶部门牌仍按 101 → 102 → 103 排列，不新增房间。

## Edge Cases

- 1440×900、1366×768、390×844。
- exploring、reflection、candidate、seated。
- 规则栏、门标、左下桌组、Candidate 均不得互相覆盖。
- Reduced Motion 与第二次 Reset 不改变取景结果。

## Acceptance Criteria

- [x] A. 首屏五个桌组整体靠近黑板，底部桌组与下边框存在清晰留白。
- [x] B. 左下桌组及学生与课堂规则栏、舞台边框无覆盖。
- [x] C. 未承载功能的讲台块和虚线路径不再渲染。
- [x] D. 门标显示“通往走廊 / 1F →”，顶部 101–103 为严格三列且顺序正确。
- [x] E. Golden Path、学生点击、Candidate、Reset 保持可用；console/page error 为 0。
- [x] F. typecheck、lint、test、build、diff-check 全绿。

## Verification

- Commands: `npm run typecheck`、`npm run lint`、`npm test`、`npm run build`、`git diff --check`。
- Visual: 1440×900、1366×768、390×844；至少覆盖 exploring、reflection、candidate。
- Artifacts: `verification/TASK-017/report.md` 与关键截图。

## Do Not / Rollback / Blocker Rule

不修改 fixture 坐标或核心设计 Token。若增加安全锚点无法同时满足顶部和底部留白，则只调整 Canvas 的 presentation fit，不把布局变化写回 Domain fixture。Rollback 回退本 Task 的三个实现文件。

## Docs to Update

`tasks/README.md`、本 Task、`verification/TASK-017/report.md`。
