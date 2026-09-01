# PROP-0002 — Demo V2 Experience Upgrade

- Status: Accepted
- Decision owner: Current user instruction
- Date: 2026-09-01

## Problem

Vertical Slice 01 proves the data-to-Classroom concept, but its desktop composition, circular Student nodes, and missing Candidate → Seatmate interaction do not yet prove the intended product experience.

## Evidence

- At 1440×900 the header consumes disproportionate vertical space while the Classroom remains a single undifferentiated canvas.
- `ForceGraphCanvas` currently paints numbered circles; no character body, desk, posture, or role state is present.
- Candidate Seat and Seatmate are absent from the current fixture and interaction reducer.
- The current user instruction explicitly requests a desktop-first Demo V2, an original Student Character System, and a complete Mock Seatmate path while retaining the architecture and data pipeline.

## Impact

- The Classroom route becomes a desktop-first scene with a persistent context rail and responsive mobile fallback.
- Canvas rendering gains character, desk, cluster-zone, Candidate, selected, and Seatmate visual states without changing Classroom coordinates or the force-graph dependency.
- A disclosed local Demo Scenario provides a Golden note, Candidate Seat, Seatmate rationale, and deterministic conversation.
- No Domain Schema, API, Provider, dependency, or backend behavior changes.

## Alternatives (include keep current)

- Keep V1: fails the requested product proof.
- Replace Canvas with SVG/DOM sprites: increases 48h risk and duplicates the existing adapter boundary.
- Add avatar images only: fails Character Presence and state requirements.
- Add a standalone Seatmate page: breaks the frozen Classroom/Seat spatial metaphor.

## Migration Cost

The Mock Scenario can later be replaced by a validated `AnalysisResult` plus a Seatmate-specific contract. Character drawing remains isolated inside the Canvas adapter. Removing the Demo Scenario returns to Classroom-only behavior without data migration.

## Recommendation

Upgrade the existing route in place. Keep the fixture, schemas, fixed positions, relation validation, Student Inspector, and accessible roster; replace only the experience composition and Canvas renderer, then add a clearly disclosed Mock Golden Path.

## Affected Files / Contracts / Tasks

`src/features/classroom/**`, `src/app/**`, `data/fixtures/scenarios/**`, decision docs, TASK-013, verification evidence. No changes to `src/domain`, `src/server`, API contracts, dependencies, or design-token values.

## Rollback

Revert TASK-013 experience files and Demo Scenario; TASK-006 Classroom fixture and contract tests remain valid.

## Decision Owner / Deadline

Accepted under the user's 2026-09-01 Demo V2 instruction; implement and verify in the current iteration.
