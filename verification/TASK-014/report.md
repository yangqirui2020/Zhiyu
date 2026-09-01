# TASK-014 Verification Report

- Result: PASS
- Date: 2026-09-01
- Route: `/classroom/q_learn_programming`
- Data mode: Mock Classroom Fixture + disclosed deterministic Demo Scenario
- Task / decisions: TASK-014, PROP-0003, UXDR-0003, PDR-0003

## V2 Diagnosis and retained boundaries

The previous Demo already had valid fixed Student coordinates, 40 source/evidence relations, Canvas isolation, an accessible roster, Student Inspector, exact-sample Candidate guard, and one deterministic Seatmate interaction. The remaining problem was the presentation grammar: five circular cluster bubbles, miniature anti-aliased characters, a decorative blackboard, a text-heavy Seatmate rail, and no visible world beyond Classroom 01.

TASK-014 retained the fixture, Domain Schema, selectors, evidence resolution, state boundaries, Candidate conditions, sample guard, Student Sheet, and backend/dependency surface. It changed only the Experience/Visual/Spatial layer.

## Implemented result

- Canvas now paints a tiled classroom floor, cross aisle, entrance path, podium, clipped-corner study zones, shared table rails, and crisp block characters.
- Character appearance is composed from four skin/hair tones, four hair silhouettes, cluster shirts, facing, four props, posture, and number plates; selected group, selected Student, Candidate-related Students, and Seatmate use shape/state cues in addition to color.
- Sparse blink, head-lift, and page-turn frames stop when `prefers-reduced-motion: reduce` is true; CSS portrait blinking is also removed by the media query. The in-app browser reported normal motion and does not expose media emulation, so the reduced-motion branch was verified through its explicit JS/CSS guard rather than a separate emulated screenshot.
- The blackboard now carries the question, room identity, 40/5 overview, classroom rule, and focused group.
- Classroom 02–04 are interactive corridor previews, explicitly labelled as not-yet-loaded data and never routed to fake classrooms.
- Candidate reveal shows `空位亮起 → 邻桌关联 → 同桌成立`, the amber desk, a stepped neighbor path, nearby related Students, and a structured Candidate rail.
- Seatmate rail now presents pixel identity, Student number/name, group, non-numeric rationale, common/different/discussion rows, preset question, deterministic response, and actions. In conversation state repeated relationship rows collapse so the complete reply remains visible at 1440×900.

## Automated gates

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS — 11/11 contract assertions
- `npm run build`: PASS — Classroom route prerendered with SSG
- `git diff --check`: PASS

## Browser Golden Path

Production build was exercised in the in-app browser:

1. Open Classroom and confirm blackboard, five table groups, 40 pixel Students, entrance, aisle, context rail, and 01–04 corridor doors.
2. Open Classroom 02 preview; verify `走廊预告` and honest disclosure; return to Classroom 01.
3. Open note composer, select the exact sample, and confirm analysis becomes enabled.
4. Reveal Candidate Seat; verify three conditions and 40/5 sample boundary.
5. Open Student 40 as Seatmate; verify identity, adjacent spatial evidence, common ground, difference, and discussion prompt.
6. Trigger one preset response; the complete reply is within the 900px viewport (`top=453.09`, `bottom=501.09`).
7. Reset; Candidate panel count returns to zero and Candidate story disappears.
8. Open Student 01 from the Canvas-equivalent DOM roster; verify argument, cluster explanation, Mock source disclosure, and `ev_mock_01` evidence resolution.
9. Close with Escape; focus returns to the Student 01 roster button.

Browser console errors/warnings: none.

## Visual QA

| Viewport | Result | Evidence |
|---|---|---|
| 1440×900 | PASS | `1440x900-ready.png`; stage + 384px rail, no horizontal overflow |
| 1440×960 | PASS | `1440x960-ready.png`; desktop composition remains stable |
| 1920×1080 | PASS | `1920x1080-ready.png`; max-width 1600 scene, no horizontal overflow |
| 1366×768 | PASS | `1366x768-ready.png`; CTA visible, rail scrolls internally |
| 390×844 | PASS | `390x844-ready.png`; no horizontal overflow, scene then rail |

Additional evidence:

- `1440x900-corridor.png`
- `1440x900-candidate.png`
- `1440x900-seatmate.png`
- `1440x900-conversation.png`
- `1440x900-student-inspector.png`

## Trust / scope checks

- No Student is called a representative or Agent; the fixture has no representative role.
- No match percentage, novelty, correctness, support rate, knowledge-gap, or mastery claim is shown.
- Extra classrooms remain presentation-only previews; no fake route or loaded data is implied.
- Candidate remains bounded by current 40 Mock sources and five groups.
- Seatmate response remains labelled `预设对话 · 非实时 AI 回复`.

## Known limits

- Additional classrooms do not yet have routes or datasets.
- Candidate/Seatmate analysis remains exact-sample deterministic Mock behavior.
- Canvas is visual-only; keyboard users continue through the equivalent roster and Student Sheet.
