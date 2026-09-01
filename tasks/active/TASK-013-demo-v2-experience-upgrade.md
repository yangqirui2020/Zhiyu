# TASK-013 — Demo V2 Desktop Classroom + Seatmate Golden Path

- Status: Done
- Owner: Primary Agent
- Estimate: 5h
- Freeze deadline: End of current iteration

## Goal

At 1440×900 the existing Classroom reads as a desktop scene populated by Students, and one disclosed Mock path completes Candidate Seat → Seatmate → deterministic interaction without changing backend or Domain contracts.

## Why in Golden Path

This upgrades the existing proof from a graph viewer into the intended Classroom experience and adds the second Wow Moment immediately after Candidate Reveal.

## Dependencies / Inputs / Outputs

- Dependencies: TASK-006 Done; PROP-0002, PDR-0003, UXDR-0003 Accepted.
- Inputs: existing Mock Classroom, frozen design tokens, fixed Student positions and evidence relations.
- Outputs: desktop-first composition, Canvas Character System, Demo Scenario, Candidate/Seatmate rail, responsive and visual verification.

## Scope

- Allowed Files: `src/features/classroom/**`, `src/app/**`, `data/fixtures/scenarios/**`, `docs/proposals/PROP-0002-demo-v2-experience-upgrade.md`, `docs/decisions/**`, `tasks/README.md`, this Task, `README.md`, `verification/TASK-013/**`.
- Forbidden Files: `src/domain/**`, `src/contracts/**`, `src/server/**`, `data/snapshots/**`, dependency manifests, existing Classroom fixture content.
- Non-Scope: real Candidate/Seatmate API, arbitrary-note analysis, free chat, memory, account/social features, data pipeline changes.

## Contracts & Decisions

CONTRACT-DOMAIN-001 rc.1 (unchanged); PDR-0002; UXDR-0001/0002/0003; PDR-0003; PROP-0002.

## States / Events / Guards / Effects / Recovery

- Local Demo state: `explore | composing | candidate | seatmate | conversation` plus Student selection.
- Sample submission deterministically reveals one Candidate Seat and one Seatmate; editing is local and clearly disclosed as Demo behavior.
- Student selection and Seatmate context replace each other in the single rail.
- Reset returns to `explore` without replaying Classroom entry.
- Reduced Motion shows final character/seat state without periodic motion.

## Exact UI Copy

- Primary action: `把我的笔记带进来`
- Sample action: `使用示例笔记`
- Candidate: `这里可能有你的一席`
- Seatmate reveal: `看来你有同桌了`
- Mock disclosure: `Demo V2 · Mock 场景`
- Rationale lead: `你们都关注“如何根据学习者调整路径”，但他强调路线切换的时机，你补充了先用短周期实验验证起点。`

## Edge Cases

Student selection before/after Candidate; close and reopen Seatmate; reset; narrow laptop; mobile bottom sheet; keyboard focus; Reduced Motion; no canvas interaction dependency for accessible path.

## Acceptance Criteria

- [x] Desktop first screen uses a dominant Classroom plus one valuable context rail and no longer reads as a widened mobile stack.
- [x] Students visibly have head/body/desk or prop and at least selected + Seatmate + idle-compatible visual states.
- [x] 1–3 low-cost liveness cues work and are removed under Reduced Motion.
- [x] Proximity, subtle zones, labels, and equal-weight colors retain cluster meaning.
- [x] Golden note reveals Candidate in the original scene and explains all three candidate conditions with sample bounds.
- [x] The nearby Seatmate is visible, understandable, clickable, and completes one deterministic interaction.
- [x] Existing Student detail/evidence, 40-source relations, Mock disclosure, and accessible roster do not regress.
- [x] 1440×900, 1366×768, 1920×1080, and 390×844 pass browser QA with no console or layout errors.

## Verification

- Commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Visual: ready, Student, note, Candidate, Seatmate/conversation, reset, Reduced Motion at required viewports.
- Artifacts: `verification/TASK-013/report.md` and screenshots.

## Do Not / Rollback / Blocker Rule

Do not imply a real API, full-text source, Agent, real person, match score, novelty, correctness, or mastery. Rollback removes Scenario and V2 experience files while retaining TASK-006 contracts and fixture.

## Docs to Update

`tasks/README.md`, `docs/decisions/INDEX.md`, `verification/TASK-013/report.md`, `README.md`.
