# PROP-0001 — Fixture-first Classroom Vertical Slice

- Status: Accepted
- Decision owner: Current user instruction
- Date: 2026-08-31

## Problem

Vertical Slice 01 must make Classroom observable now, while TASK-004/005 have not produced a real, verified Zhihu Snapshot. Treating synthetic content as Snapshot would violate the frozen provenance rules.

## Evidence

- The repository has no verified historical Zhihu source asset or Snapshot manifest.
- The current instruction explicitly prioritizes a static Snapshot / Fixture Classroom before Live providers.
- `ARCH-DEPENDENCIES-001` already approves `react-force-graph-2d` 1.29.1 for the Classroom visualization gate; the upstream project documents Canvas rendering and node hover/click support.

## Impact

- TASK-006 may use a contract-shaped synthetic fixture with `mode: "mock"` and visible development disclosure.
- The fixture is stored under `data/fixtures`, never `data/snapshots`.
- The planned `react-force-graph-2d` 1.29.1 dependency may be installed at this task with an exact version.
- This does not freeze Live providers, clustering thresholds, Candidate Seat, Awen, representatives, or a real Snapshot pipeline.

## Alternatives (include keep current)

- Wait for TASK-004/005 real data: preserves the original dependency graph but blocks the requested Classroom experience test.
- Mislabel synthetic data as Snapshot: rejected because it breaks provenance and trust.
- Build an unplanned visualization stack: rejected because the existing architecture already names the adapter and dependency.

## Migration Cost

The fixture can later be replaced by a validated Classroom Snapshot with no UI schema change. Mock-only copy and fixture imports are removed when `SnapshotClassroomSource` exists.

## Recommendation

Implement the complete visual slice as TASK-006 using a disclosed Mock Fixture, the existing Classroom contract, and the approved ForceGraph adapter boundary.

## Affected Files / Contracts / Tasks

`package.json`, lockfile, `src/domain/schemas`, `data/fixtures`, `src/features/classroom`, `src/app`, contract tests, TASK-006, verification evidence. No frozen product meaning changes.

## Rollback

Remove TASK-006 UI/fixture files and the exact visualization dependency; TASK-001 baseline remains intact.

## Decision Owner / Deadline

Accepted under the user's 2026-08-31 instruction to begin Vertical Slice 01 immediately and prefer Snapshot / Fixture data.
