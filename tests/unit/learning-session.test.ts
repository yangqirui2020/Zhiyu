import assert from "node:assert/strict";
import { it } from "node:test";
import { initialSessionState, sessionReducer, type SessionState, type PreparedLearning, type CompletedLearning } from "../../src/features/classroom/session-machine.ts";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { candidateSampleSchema } from "../../src/domain/schemas/candidate-generation.ts";
const { assets, classroom } = await readSnapshotBundle();
const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
const candidate = candidateSampleSchema.parse(assets["analysis/sample.json"]);
const identity = { schemaVersion: "1.0.0-rc.2" as const, questionId: classroom.question.id, classroomRevision: classroom.revision };
const prepared: PreparedLearning = { ...identity, ...sample.question, stage: "prepared", challengeToken: "test_challenge_token" };
const completed: CompletedLearning = { ...identity, ...sample.completion, stage: "completed", id: "learning_test" };
const meta = { requestId: "req_server_test", mode: "live" as const, servedAt: new Date().toISOString(), warnings: [] };
const starting: SessionState = { ...initialSessionState, phase: "candidate", opinionText: sample.noteText, candidate: { status: "resolved", result: candidate.result, submittedText: sample.noteText, meta } };

it("requires a prepared real peer, then completes a personal response and a second session", () => {
  assert.equal(sessionReducer(starting, { type: "open_seatmate" }), starting);
  let state = sessionReducer(starting, { type: "start_learning", stage: "prepare", requestId: "prepare_1" });
  assert.equal(sessionReducer(state, { type: "resolve_learning", requestId: "stale", result: prepared, meta }), state);
  assert.equal(sessionReducer(state, { type: "resolve_learning", requestId: "prepare_1", result: { ...prepared, classroomRevision: "wrong" }, meta }), state);
  state = sessionReducer(state, { type: "resolve_learning", requestId: "prepare_1", result: prepared, meta });
  assert.equal(state.phase, "seatmate");
  state = sessionReducer(state, { type: "start_challenge" });
  state = sessionReducer(state, { type: "edit_answer", value: "这是一条不匹配示例的个人回应，会被真实处理。" });
  state = sessionReducer(state, { type: "start_learning", stage: "complete", requestId: "complete_1" });
  assert.equal(sessionReducer(state, { type: "edit_answer", value: "提交期间不修改" }), state);
  state = sessionReducer(state, { type: "reject_learning", requestId: "complete_1", message: "暂时失败" });
  assert.equal(state.phase, "challenge");
  assert.equal(state.answerText, "这是一条不匹配示例的个人回应，会被真实处理。");
  state = sessionReducer(state, { type: "start_learning", stage: "complete", requestId: "complete_2" });
  state = sessionReducer(state, { type: "resolve_learning", requestId: "complete_2", result: completed, meta });
  assert.equal(state.phase, "responded");
  state = sessionReducer(state, { type: "open_my_seat" });
  state = sessionReducer(state, { type: "claim_seat" });
  assert.equal(state.phase, "seated");
  state = sessionReducer(state, { type: "reset" });
  assert.deepEqual(state, initialSessionState);
  assert.equal(sessionReducer(state, { type: "resolve_learning", requestId: "complete_2", result: completed, meta }), state);
  assert.equal(sessionReducer(state, { type: "start_roundtable" }).phase, "roundtable");
});

it("preserves the initial opinion when preparation fails and allows retry", () => {
  let state = sessionReducer(starting, { type: "start_learning", stage: "prepare", requestId: "prepare_fail" });
  state = sessionReducer(state, { type: "reject_learning", requestId: "prepare_fail", message: "暂时失败" });
  assert.equal(state.opinionText, sample.noteText);
  assert.equal(state.phase, "candidate");
  assert.equal(sessionReducer(state, { type: "start_learning", stage: "prepare", requestId: "prepare_retry" }).learning.status, "preparing");
});
