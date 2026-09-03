import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mockClassroomFixture } from "../../data/fixtures/classrooms/learn-programming.ts";
import {
  apiFailureSchema,
  apiMetaSchema,
  candidateSeatRequestSchema,
  classroomApiSuccessSchema,
} from "../../src/contracts/api.ts";

describe("P0 API contracts", () => {
  it("accepts an explicit Mock classroom envelope", () => {
    assert.equal(classroomApiSuccessSchema.safeParse({
      ok: true,
      data: mockClassroomFixture,
      meta: {
        requestId: "req_api_contract",
        mode: "mock",
        servedAt: "2026-09-02T00:00:00.000Z",
        warnings: mockClassroomFixture.provenance.warnings,
      },
    }).success, true);
  });

  it("requires snapshot provenance and paired fallback disclosure", () => {
    assert.equal(apiMetaSchema.safeParse({
      requestId: "req_snapshot_contract",
      mode: "snapshot",
      servedAt: "2026-09-02T00:00:00.000Z",
      warnings: [],
    }).success, false);
    assert.equal(apiMetaSchema.safeParse({
      requestId: "req_fallback_contract",
      mode: "mock",
      servedAt: "2026-09-02T00:00:00.000Z",
      fallbackFrom: "live",
      warnings: [],
    }).success, false);
  });

  it("validates note length and idempotency", () => {
    const valid = {
      schemaVersion: "1.0.0-rc.1",
      questionId: "q_learn_programming",
      classroomRevision: "mock-classroom-v1",
      noteText: "这是一段超过五十个字符的观点，用于确保服务端不会在证据不足时把任意输入匹配到预计算候选席位，并且会保留用户输入。",
      idempotencyKey: "req_candidate_contract",
    };
    assert.equal(candidateSeatRequestSchema.safeParse(valid).success, true);
    assert.equal(candidateSeatRequestSchema.safeParse({ ...valid, noteText: "太短" }).success, false);
  });

  it("keeps stable error codes and recovery actions", () => {
    assert.equal(apiFailureSchema.safeParse({
      ok: false,
      error: {
        requestId: "req_error_contract",
        code: "PROVIDER_TIMEOUT",
        message: "分析超时",
        retryable: true,
        recovery: "retry",
      },
    }).success, true);
  });
});
