# TASK-013 Verification Report

- Result: PASS
- Date: 2026-09-01
- Route: `/classroom/q_learn_programming`
- Data mode: Mock Classroom Fixture + disclosed Demo V2 Scenario

## V1 Diagnosis

V1 already had a 1600px container, fixed Classroom coordinates, valid evidence relations, Canvas isolation, Student Sheet, and an accessible roster. Its product problem was information architecture rather than a literal mobile width: header → canvas → five-column roster remained one vertical document flow; the Inspector appeared only after selection and narrowed the stage; students were numbered circles; Candidate and Seatmate did not exist.

The V2 implementation therefore retained the data, Domain Schema, evidence selectors, fixed positions, force-graph dependency, Sheet content, and contract tests. It changed only the experience composition, Canvas renderer, and a separate Mock Scenario.

## Automated gates

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm test`: PASS — 11/11 contract assertions
- `npm run build`: PASS — preset route prerendered with SSG
- `git diff --check`: PASS

## Browser Golden Path

Production build was exercised in the in-app browser:

1. Open Classroom at 1440×900.
2. Open `把我的笔记带进来`.
3. Confirm analysis is disabled for empty/arbitrary text.
4. Use the exact sample note; analysis becomes enabled.
5. Reveal Candidate Seat in the original Classroom.
6. Verify the three rows: 与问题相关 / 来自你的笔记 / 当前覆盖较少.
7. Open Student 40 as Seatmate and verify the non-numeric rationale, common ground, and difference.
8. Trigger `问问同桌` and receive one deterministic response labelled `预设对话 · 非实时 AI 回复`.
9. Reset and open Student 01 through the Canvas-equivalent DOM roster; verify argument, cluster explanation, source disclosure, and `ev_mock_01` evidence resolution.

Browser console errors/warnings: none.

## Visual QA

| Viewport | Result | Evidence |
|---|---|---|
| 1440×900 | PASS | Stable dominant stage + 376px context rail; no horizontal overflow |
| 1440×960 | PASS | Stage scales vertically without oversized type or dead side space |
| 1920×1080 | PASS | 1600px frame, 1192px stage + 384px rail; page fits viewport height |
| 1366×768 | PASS | 887px stage + 376px rail; internal rail scroll; no horizontal overflow |
| 390×844 | PASS after fix | Single-column degradation; old fixed-workspace-height overlap removed; 14px gap between stage and rail |

Reduced Motion has two explicit paths: CSS removes rail/stage transitions, and the Candidate renderer skips the 320ms reveal when `prefers-reduced-motion: reduce` matches. Static character identity and all causal copy remain present.

## Visual questions

- Desktop still looks like an enlarged phone page: No. Horizontal space carries the Classroom and its current context simultaneously.
- First read is Graph or Classroom: Classroom. Blackboard, seated bodies, desks/props, entrance, group floor zones, and persistent classroom language precede the technical cluster explanation.
- Students read as people without labels: Yes. Each has a head, hair, eyes, torso, arms, chair/desk, and one of three study props.
- Liveness: Hover/selected posture changes, selected raised arm, and Seatmate turn/wave state; Candidate has one 320ms reveal halo.
- Clustering remains understandable: Yes. Fixed proximity, subtle equal-weight floor zones, labels, and colors remain.
- Candidate remains a Wow Moment: Yes. The amber seat enters the existing scene and connects to the nearby Student.
- Seatmate is complete: Yes. Visible, explained, clickable, comparable, and one interaction is complete.
- Story is natural: Explore → sample note → Candidate → neighbor reveal → rationale → conversation.

## Screenshots

- `1440x900-ready.png`
- `1440x900-candidate.png`
- `1440x900-seatmate-conversation.png`
- `1440x900-student-inspector.png`
- `1440x960-ready.png`
- `1920x1080-ready.png`
- `1366x768-ready.png`
- `390x844-ready.png`

## Mock boundary / next version

- Classroom sources remain synthetic Mock Fixture data, never described as Snapshot or real Zhihu content.
- Candidate analysis only accepts the exact sample note; arbitrary notes are retained but cannot trigger the precomputed result.
- Seatmate identity, rationale, and response are deterministic Scenario data, not a real person, Agent, match score, or live AI.
- Next version should replace Scenario presentation data with frozen Candidate/Seatmate contracts and a real validated analysis path; real Snapshot/Provider work remains unchanged and out of scope.
