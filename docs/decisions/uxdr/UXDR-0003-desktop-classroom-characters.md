---
id: UXDR-0003
status: Accepted
date: 2026-09-01
owner: Current User
scope: Demo V2 desktop Classroom
supersedes: []
---

# Desktop Classroom is a scene with character presence and one context rail

## Context / User Problem

The V1 Classroom reads as a graph with numbered nodes and uses desktop space mainly by widening the same vertical flow.

## Constraints and Evidence

The continuous Classroom, fixed coordinates, one Inspector at a time, cluster meaning, accessible DOM list, reduced motion, and existing design tokens remain valid.

## Options (include “keep current”)

- Keep the full-width graph: weak spatial and contextual hierarchy.
- Use multiple dashboard cards: conflicts with the Classroom metaphor.
- Use a dominant scene plus one contextual rail: gives horizontal space information value while preserving spatial context.

## Decision

At desktop widths the route uses a compact application header, a dominant Classroom scene, and one 336–384px context rail. Students are drawn as original compact characters with head, torso, desk/prop, facing, selection, and Seatmate states. Cluster zones use subtle floor cues and proximity rather than large boxes. Candidate appears inside the same scene; Seatmate content replaces—not stacks beside—the current rail content. Mobile degrades to a single scene and bottom sheet.

## Consequences and Guardrails

- Character motion is limited to low-amplitude blink/look/book cues and stops under Reduced Motion.
- Distances and cluster labels remain legible; color is secondary to spatial grouping.
- The rail must always answer either “what can I do next?” or “what am I inspecting?”—never become a general dashboard.

## Migration / Rollback Cost

Canvas drawing and rail composition can be reverted independently; Classroom data contracts do not change.

## Verification / Revisit Trigger

Verify 1440×900, 1366×768, 1920×1080, and 390×844; revisit rendering technology only if Canvas character hit-testing or accessibility cannot meet gates.

## Related Specs / Tasks

DESIGN-001, UXDR-0001, UXDR-0002, PROP-0002, TASK-013.
