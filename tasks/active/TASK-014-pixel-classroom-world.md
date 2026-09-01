# TASK-014 — Pixel Classroom World + Structured Seatmate

- Status: Done
- Owner: Primary Agent
- Estimate: 5h
- Freeze deadline: End of current iteration

## Goal

At 1440×900, 1440×960, and 1920×1080 the existing Demo reads first as an original pixel classroom with group tables, distinct seated characters, a functional blackboard, and a larger campus context; the sample path completes Candidate Seat → adjacent Seatmate → one deterministic interaction without changing backend or Domain contracts.

## Why in Golden Path

This is a visual/spatial refinement of TASK-013: it makes the Classroom metaphor and relationship object legible before the underlying clustering explanation, while preserving the same bounded Mock proof.

## Dependencies / Inputs / Outputs

- Dependencies: TASK-013 Done; PROP-0003 Accepted; PDR-0003 and UXDR-0003 Accepted.
- Inputs: existing Mock Classroom, fixed Student positions, Demo Seatmate Scenario, frozen tokens and contracts.
- Outputs: pixel Canvas scene, reusable role-aware character language, campus/corridor preview, structured Seatmate inspector, visual verification.

## Scope

- Allowed Files: `src/features/classroom/**`, `src/app/**`, `data/fixtures/scenarios/**`, `docs/proposals/PROP-0003-pixel-classroom-world.md`, `tasks/README.md`, this Task, `README.md`, `verification/TASK-014/**`.
- Forbidden Files: `src/domain/**`, `src/contracts/**`, `src/server/**`, `data/snapshots/**`, dependency manifests, existing Classroom fixture content, frozen token values.
- Non-Scope: real classroom switching, new question routes, real Candidate/Seatmate API, arbitrary-note analysis, free chat, social identity, image assets, game engine, backend/data-pipeline changes.

## Contracts & Decisions

CONTRACT-DOMAIN-001 rc.1 and CONTRACT-STATE-001 rc.1 unchanged; UXDR-0001/0002/0003; PDR-0002/0003; PROP-0003.

## States / Events / Guards / Effects / Recovery

- Retain local Demo states and exact-sample guard from TASK-013.
- Student selection, Candidate, Seatmate, and conversation continue to replace one another in one context rail.
- Corridor entries are honest previews only and never imply loaded classroom data.
- Reduced Motion freezes periodic character cues and directly shows final Candidate/Seatmate relation.
- Reset removes Candidate/Seatmate/Conversation state without replaying classroom entry.

## Acceptance Criteria

- [x] Desktop first read is a classroom scene rather than a plot: tile floor, blackboard, entrance, aisle, group desks/zones, and seated relationships are visible.
- [x] Circular cluster bubbles are removed; proximity, angular floor cues, group-table layouts, labels, and equal-weight colors retain cluster meaning.
- [x] Students use a reusable pixel/block character system with multiple hair, clothing, skin/prop/facing variants and selected/group/Seatmate/Candidate-compatible states.
- [x] Sparse blink/look/book or selection cues provide life and stop under Reduced Motion.
- [x] The blackboard carries the current question, room identity, sample/group counts, classroom rule, and focused group when applicable.
- [x] Seatmate rail is structured as identity, relationship, preset interaction, and actions; it includes a recognizable pixel portrait and non-numeric rationale.
- [x] Candidate reveal visibly establishes the empty seat, nearby related student, and Seatmate relationship before the rail interaction.
- [x] UI exposes Classroom 02–04 as clearly labelled preview entrances without fake routes or data.
- [x] Existing Student detail/evidence, accessible roster, 40-source relations, Mock disclosure, sample guard, reset, and keyboard paths do not regress.
- [x] 1440×900, 1440×960, 1920×1080, 1366×768, and 390×844 pass browser QA with no console or layout errors.

## Verification

- Commands: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`.
- Browser: ready, Student, note, Candidate, Seatmate, conversation, reset, corridor preview, Reduced Motion.
- Artifacts: `verification/TASK-014/report.md` and required viewport screenshots.

## Do Not / Rollback / Blocker Rule

Do not imply real multi-classroom data, a real person, Agent, match score, novelty, correctness, support rate, mastery, full-text evidence, or live AI. Rollback removes TASK-014 presentation changes while retaining TASK-013 contracts and Mock Golden Path.

## Docs to Update

`tasks/README.md`, this Task, `verification/TASK-014/report.md`, and `README.md` if the experience description changes materially.
