import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analysisResultSchema } from "../../src/domain/schemas/candidate.ts";

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
  { type: "submit_opinion", requestId: "req_test_12345678" },
  {
    type: "resolve_opinion",
    requestId: "req_test_12345678",
    result: analysisResultSchema.parse({
      schemaVersion: "1.0.0-rc.1",
      id: "analysis_test",
      questionId: "q_test",
      classroomRevision: "revision-test",
      status: "success",
      claims: [{
        id: "claim_test",
        text: "示例观点",
        normalizedText: "示例观点",
        noteEvidenceIds: ["ev_note_test"],
      }],
      assessments: [{
        claimId: "claim_test",
        relevance: { value: "related", evidenceIds: ["ev_note_test"], explanation: "相关" },
        noteSupport: { value: "supported", evidenceIds: ["ev_note_test"], explanation: "有笔记支持" },
        coverage: { value: "limited", evidenceIds: ["ev_source_test"], explanation: "覆盖较少" },
        decision: "candidate",
      }],
      candidateSeats: [{
        id: "seat_test",
        claimId: "claim_test",
        title: "这里可能有你的一席",
        disclosure: "测试数据",
        evidencePanel: {
          relevanceEvidenceIds: ["ev_note_test"],
          noteSupportEvidenceIds: ["ev_note_test"],
          coverageEvidenceIds: ["ev_source_test"],
        },
        outline: null,
      }],
      evidence: [
        { id: "ev_note_test", kind: "note_excerpt", text: "示例观点", start: 0, end: 4 },
        { id: "ev_source_test", kind: "source_excerpt", text: "来源摘要", sourceContentId: "src_test" },
      ],
      warnings: [],
      analyzedAt: "2026-09-02T00:00:00.000Z",
    }),
  },
  { type: "open_seatmate" },
  { type: "start_challenge" },
  { type: "use_sample_answer", value: "示例回应" },
  { type: "submit_answer", sampleMatches: true },
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
      { type: "submit_opinion", requestId: "req_illegal_12345678" },
      { type: "open_seatmate" },
      { type: "start_challenge" },
      { type: "submit_answer", sampleMatches: false },
      { type: "open_my_seat" },
      { type: "claim_seat" },
    ];

    const result = dispatchAll(initialSessionState, illegalEvents);
    assert.deepEqual(result, initialSessionState);

    const reflection = dispatchAll(initialSessionState, [
      { type: "start_roundtable" },
      { type: "roundtable_finish" },
      { type: "edit_opinion", value: "   " },
      { type: "submit_opinion", requestId: "req_blank_12345678" },
    ]);
    assert.equal(reflection.phase, "reflection");
  });

  it("keeps stale, failed and no-candidate analyses in reflection", () => {
    const analyzing = dispatchAll(initialSessionState, [
      { type: "start_roundtable" },
      { type: "roundtable_finish" },
      { type: "edit_opinion", value: "这是一段足够提交的观点文本" },
      { type: "submit_opinion", requestId: "req_current_12345678" },
    ]);
    const stale = sessionReducer(analyzing, {
      type: "reject_opinion",
      requestId: "req_stale_12345678",
      message: "旧请求失败",
    });
    assert.equal(stale.candidate.status, "analyzing");

    const failed = sessionReducer(stale, {
      type: "reject_opinion",
      requestId: "req_current_12345678",
      message: "网络暂时不可用",
    });
    assert.equal(failed.phase, "reflection");
    assert.equal(failed.candidate.status, "error");

    const retried = sessionReducer(failed, {
      type: "retry_opinion",
      requestId: "req_retry_12345678",
    });
    assert.equal(retried.candidate.status, "analyzing");
    if (retried.candidate.status === "analyzing") {
      assert.equal(retried.candidate.submittedText, "这是一段足够提交的观点文本");
      assert.equal(retried.candidate.requestId, "req_retry_12345678");
    }
  });

  it("does not advance a non-matching seatmate response", () => {
    const challenge = dispatchAll(initialSessionState, completePath.slice(0, 8));
    const edited = sessionReducer(challenge, { type: "edit_answer", value: "任意回答" });
    const blocked = sessionReducer(edited, {
      type: "submit_answer",
      sampleMatches: false,
    });
    assert.equal(blocked.phase, "challenge");
  });

  it("keeps student and campus panels orthogonal to the active phase", () => {
    const challenge = dispatchAll(initialSessionState, completePath.slice(0, 7));
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
