# TASK-006 Verification Report

- Result: PASS
- Date: 2026-08-31
- Route: `/classroom/q_learn_programming`
- Data mode: `mock`
- Fixture: 40 Students / 40 unique Sources / 40 Arguments / 40 Evidence / 5 Clusters

## Automated gates

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS — 11/11 contract assertions
- `npm run build`: PASS — preset classroom route prerendered with SSG
- `npm audit --audit-level=high`: PASS — 0 vulnerabilities

## Contract evidence

- `classroomSchema` validates entity shapes and all Classroom relations.
- Students, Sources, and Arguments form complete one-to-one mappings.
- Every Argument evidenceId resolves to source-excerpt Evidence from the same Source.
- Every Evidence text is a verified substring of the stored excerpt.
- Tests reject missing evidence, cross-source evidence, fabricated excerpt text, duplicate source identity, cluster backlink mismatch, and broken one-to-one mappings.

## Browser QA

Production server was exercised at all required viewports.

| Viewport | Ready | Hover / Sheet | Layout | Console |
|---|---|---|---|---|
| 1440×900 | PASS | PASS | Five clusters visible; right Sheet preserves stage | No error/warn |
| 1366×768 | PASS | PASS | Compact stage keeps all five clusters visible | No error/warn |
| 390×844 | PASS | PASS | No horizontal overflow; Bottom Sheet preserves classroom context | No error/warn |

- Canvas hover shows Student, neutral Cluster, and concise argument.
- Canvas click selects a Student and visually retains/softens classroom context.
- Grouped DOM roster provides the same 40 Students outside Canvas.
- Enter opens the Sheet; Escape closes it and restores focus to the originating Student button.
- Sheet content is internally scrollable; evidence section shows `搜索摘要片段` and the resolved evidenceId.
- `prefers-reduced-motion` removes stage/sheet animations and transitions; graph coordinates are fixed with zero warmup/cooldown ticks.
- No hydration warning, page-width overflow, obvious layout shift, request race, or browser console error was observed on a clean production load.

## Screenshots

- `1440x900-ready.png`
- `1440x900-hover.png`
- `1440x900-student-sheet.png`
- `1366x768-ready.png`
- `390x844-ready.png`
- `390x844-student-sheet.png`

## Trust boundary

All Classroom content in this slice is synthetic and stored under `data/fixtures`. The UI displays `开发模式 · Mock 数据`, does not expose a fake source link, and does not claim the data is a Snapshot, original text, correctness, support rate, or social consensus.

## Non-scope confirmed

Candidate Seat, Awen, representatives, Live Zhihu Provider, embedding/clustering pipeline, long-term memory, and real Snapshot generation were not implemented.
