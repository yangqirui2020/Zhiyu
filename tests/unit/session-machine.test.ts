import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  candidateVisible,
  initialSessionState,
  noteSectionStatus,
  seatClaimed,
  sessionReducer,
  type SessionEvent,
  type SessionState,
} from "../../src/features/classroom/session-machine.ts";

function dispatchAll(
  initial: SessionState,
  events: SessionEvent[],
): SessionState {
  return events.reduce(sessionReducer, initial);
}

const completePath: SessionEvent[] = [
  { type: "start_roundtable" },
  { type: "roundtable_finish" },
  { type: "use_sample_opinion", value: "示例观点" },
  { type: "submit_opinion" },
  { type: "open_seatmate" },
  { type: "start_challenge" },
  { type: "use_sample_answer", value: "示例回应" },
  { type: "submit_answer" },
  { type: "open_my_seat" },
  { type: "claim_seat" },
];

describe("Demo V3 session reducer", () => {
  it("completes the legal learning loop in order", () => {
    const result = dispatchAll(initialSessionState, completePath);

    assert.equal(result.phase, "seated");
    assert.equal(candidateVisible(result.phase), true);
    assert.equal(seatClaimed(result.phase), true);
    assert.equal(result.opinionText, "示例观点");
    assert.equal(result.answerText, "示例回应");
  });

  it("ignores illegal phase jumps and blank submissions", () => {
    const illegalEvents: SessionEvent[] = [
      { type: "submit_opinion" },
      { type: "open_seatmate" },
      { type: "start_challenge" },
      { type: "submit_answer" },
      { type: "open_my_seat" },
      { type: "claim_seat" },
    ];

    const result = dispatchAll(initialSessionState, illegalEvents);
    assert.deepEqual(result, initialSessionState);

    const reflection = dispatchAll(initialSessionState, [
      { type: "start_roundtable" },
      { type: "roundtable_finish" },
      { type: "edit_opinion", value: "   " },
      { type: "submit_opinion" },
    ]);
    assert.equal(reflection.phase, "reflection");
  });

  it("keeps student and campus panels orthogonal to the active phase", () => {
    const challenge = dispatchAll(initialSessionState, completePath.slice(0, 6));
    const studentPanel = sessionReducer(challenge, {
      type: "select_student",
      studentId: "student_demo",
    });
    assert.equal(studentPanel.phase, "challenge");
    assert.deepEqual(studentPanel.panel, {
      kind: "student",
      studentId: "student_demo",
    });

    const campusPanel = sessionReducer(studentPanel, {
      type: "open_campus_room",
      roomNumber: "102",
      isCurrent: false,
    });
    assert.equal(campusPanel.phase, "challenge");
    assert.deepEqual(campusPanel.panel, { kind: "campus", roomNumber: "102" });
    assert.deepEqual(sessionReducer(campusPanel, { type: "close_panel" }).panel, {
      kind: "default",
    });
  });

  it("unlocks note sections only after their causal phase", () => {
    assert.deepEqual(noteSectionStatus("reflection"), {
      before: "locked",
      heard: "locked",
      changed: "locked",
      after: "locked",
    });
    assert.deepEqual(noteSectionStatus("candidate"), {
      before: "ready",
      heard: "ready",
      changed: "locked",
      after: "locked",
    });
    assert.deepEqual(noteSectionStatus("challenge"), {
      before: "ready",
      heard: "ready",
      changed: "ready",
      after: "locked",
    });
    assert.equal(noteSectionStatus("responded").after, "ready");
  });

  it("reset clears the session and permits a second complete run", () => {
    const firstRun = dispatchAll(initialSessionState, completePath);
    const reset = sessionReducer(firstRun, { type: "reset" });
    assert.deepEqual(reset, initialSessionState);

    const secondRun = dispatchAll(reset, completePath);
    assert.equal(secondRun.phase, "seated");
    assert.equal(secondRun.roundtableStep, 0);
  });
});
