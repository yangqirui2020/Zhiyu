# TASK-006 — Vertical Slice 01: Mock Fixture Classroom

- Status: Done
- Owner: Primary Agent
- Estimate: 5h
- Freeze deadline: Before Candidate Seat implementation

## Goal

打开预设问题页即可进入一间完整、可探索的观点教室，并能从学生座位追溯到已校验的证据片段。

## Why in Golden Path

这是“一道问题 = 一间教室”第一次成为真实产品界面；本轮只验证 Classroom 的空间隐喻、可读性与学生探索体验。

## Dependencies / Inputs / Outputs

- Dependencies: TASK-001 Done；当前用户指令批准 fixture-first 依赖例外，见 PROP-0001。
- Inputs: CONTRACT-DOMAIN-001 rc.1、UX_SPEC、DESIGN_SYSTEM、ADR-0004。
- Outputs: 可执行 Classroom schema、40 Student / 5 Cluster Mock Fixture、预设问题页、Student Detail Sheet、验证证据。

## Scope

- Allowed Files: `package.json`, `package-lock.json`, `src/domain/schemas/**`, `data/fixtures/**`, `src/features/classroom/**`, `src/app/**`, `tests/contract/**`, `docs/proposals/PROP-0001-fixture-first-classroom.md`, `tasks/active/TASK-006-vertical-slice-01-classroom.md`, `tasks/README.md`, `verification/TASK-006/**`, `README.md`.
- Forbidden Files: `src/server/**`, `data/snapshots/**`, Candidate Seat / Awen / representative behavior, provider credentials.
- Non-Scope: real Zhihu API, embedding/clustering pipeline, real Snapshot generation, long-term memory, Candidate Seat, Cluster Inspector, representative dialogue.

## Contracts & Decisions

- CONTRACT-DOMAIN-001 1.0.0-rc.1
- ADR-0004 Snapshot-first
- UXDR-0002 Sheet preserves classroom context
- PROP-0001 fixture-first disclosure and dependency gate

## States / Events / Guards / Effects / Recovery

- `ready.selection = none | student(studentId)`.
- Hover is transient and never changes fixture coordinates.
- Click / Enter / Space selects a student and opens one Sheet; selecting another replaces its contents.
- Escape / close returns focus to the triggering Student control.
- Invalid fixture or broken evidence relation fails contract verification and must not be rendered.
- Canvas failure retains the grouped DOM Student list as the usable recovery path.

## Exact UI Copy

- Mode: `开发模式 · Mock 数据`
- Meaning: `一位学生代表一条演示来源；坐得更近，表示论证更相似。`
- Evidence heading: `搜索摘要片段`
- Provenance note: `本页使用人工构造的演示数据，仅用于验证教室体验，不代表真实知乎样本。`

## Edge Cases

- Sheet open while selecting a second student.
- Escape close and focus restoration.
- Keyboard-only selection.
- Reduced Motion.
- 1440×900, 1366×768, 390×844.
- Missing or cross-source evidence is rejected by schema relation validation.

## Acceptance Criteria

- [x] Given the preset question route, when loaded, then 40 Students and 5 neutral Clusters appear in one continuous classroom stage.
- [x] Student positions are deterministic and form five visually distinct spatial groups without implying rank, correctness, or consensus.
- [x] Every Student has a 24–32px visual node and at least a 44×44px interaction target.
- [x] Hover or keyboard focus reveals Student identity, cluster, and a concise argument without moving the node.
- [x] Click / Enter / Space opens a responsive Student Detail Sheet while preserving classroom context.
- [x] The Sheet displays the Student's core view, neutral Cluster, summary/reasons, source metadata, and `搜索摘要片段` resolved through existing `evidenceId` relations.
- [x] All 40 Students map one-to-one to unique sources and arguments; every referenced evidence exists, matches its source, and is a substring of the stored excerpt.
- [x] UI visibly discloses `mode: mock`; no synthetic content is stored or described as Snapshot or original/full text.
- [x] Canvas has a grouped DOM alternative; keyboard selection, focus restoration, Escape close, and Reduced Motion work.
- [x] No Candidate Seat, Awen, representative dialogue, Live provider, or real Zhihu pipeline is introduced.

## Verification

- Commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Visual: 1440×900, 1366×768, 390×844; ready, hover/focus, selected Sheet, keyboard, Reduced Motion, no console/hydration errors.
- Artifacts: `verification/TASK-006/report.md` and viewport screenshots.

## Do Not / Rollback / Blocker Rule

Do not fabricate Snapshot provenance or evidence, generate a complete Zhihu answer, or infer correctness/support rate. Rollback removes this task's files and exact dependency without altering TASK-001. If the Canvas library cannot build on the pinned stack, record a blocker before changing visualization technology.

## Docs to Update

`tasks/README.md`, `README.md`, `verification/TASK-006/report.md`.
