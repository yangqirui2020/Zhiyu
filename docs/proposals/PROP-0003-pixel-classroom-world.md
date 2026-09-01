# PROP-0003 — Pixel Classroom World Experience Upgrade

- Status: Accepted
- Decision owner: Current user instruction
- Date: 2026-09-01

## Problem

Demo V2 establishes a desktop Classroom, compact Canvas characters, Candidate Seat, and a deterministic Seatmate path, but its primary visual grammar still reads as five circular clusters on a plotting surface. Character variants are too small to create role presence, the blackboard and entrance are decorative, the Seatmate rail is text-heavy, and `Classroom 01` appears to be the entire product world.

## Evidence

- Current verification screenshots show five large translucent circles as the dominant grouping device.
- Student bodies are present but read as repeated miniature icons at normal desktop viewing distance.
- The Canvas blackboard only says `问题黑板`; the actual question and classroom context live outside the scene.
- Candidate-to-Seatmate proximity exists, but the right rail does not lead with a recognizable character identity card or a scannable relationship structure.
- The current user instruction explicitly requests an original low-cost pixel classroom, group-table spatial grammar, structured Seatmate interaction, and a lightweight multi-classroom/campus entry while preserving the existing data and technical route.

## Impact

- The same route becomes a pixel/block classroom scene with tile floor, angular group zones, desks, aisle, entrance, functional blackboard, reusable character variants, and sparse reduced-motion-safe liveness.
- The single context rail gains a character-led Seatmate identity, relationship rows, preset interaction, and follow-up actions.
- A disclosed presentation-only corridor exposes Classroom 02–04 as previews; it does not claim working data or add routes.
- Candidate reveal remains in the original scene and visually establishes the adjacent Seatmate relationship.

## Alternatives (include keep current)

- Keep Demo V2 unchanged: does not address the current visual and world-building feedback.
- Introduce image sprite assets or a game engine: raises asset/dependency cost and is unnecessary for a 40-character scene.
- Replace Canvas with a new renderer: duplicates the existing adapter and risks accessibility/interaction regressions.
- Build real extra classrooms and chat: expands backend, data, and contract scope beyond this iteration.

## Migration Cost

The pixel renderer and presentational corridor remain isolated in the Classroom feature and Demo Scenario. They can later consume real multi-classroom data without changing the current Domain Schema. Rollback restores the prior Canvas painter and rail composition without data migration.

## Recommendation

Retain the current fixture, fixed coordinates, Canvas adapter, selectors, Student detail, Candidate guard, deterministic Seatmate Scenario, and design-token values. Refactor only the Experience/Visual/Spatial layer using Canvas primitives plus CSS pixel portraits, and verify the full Mock Golden Path at desktop viewports.

## Affected Files / Contracts / Tasks

`src/features/classroom/**`, `src/app/**`, `data/fixtures/scenarios/**`, `tasks/README.md`, `tasks/active/TASK-014-pixel-classroom-world.md`, `verification/TASK-014/**`, and this proposal. Domain/API/Provider/state contracts, dependency manifests, existing Classroom fixture content, and design-token values remain unchanged.

## Rollback

Revert TASK-014 experience files and Demo Scenario presentation fields; TASK-013 and TASK-006 behavior remains available.

## Decision Owner / Deadline

Accepted under the user's 2026-09-01 continuation instruction; implement and verify in the current iteration.
