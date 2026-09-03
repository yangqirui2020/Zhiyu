import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  analysisResultSchema,
  validateAnalysisRelations,
} from "../../src/domain/schemas/candidate.ts";

function validResult() {
  return {
    schemaVersion: "1.0.0-rc.1",
    id: "analysis_contract",
    questionId: "q_contract",
    classroomRevision: "revision-contract",
    status: "success" as const,
    claims: [{
      id: "claim_contract",
      text: "先做一个短周期试学实验。",
      normalizedText: "先做一个短周期试学实验。",
      noteEvidenceIds: ["ev_note_contract"],
    }],
    assessments: [{
      claimId: "claim_contract",
      relevance: { value: "related" as const, evidenceIds: ["ev_note_contract"], explanation: "回应问题" },
      noteSupport: { value: "supported" as const, evidenceIds: ["ev_note_contract"], explanation: "来自笔记" },
      coverage: { value: "limited" as const, evidenceIds: ["ev_source_contract"], explanation: "当前覆盖较少" },
      decision: "candidate" as const,
    }],
    candidateSeats: [{
      id: "seat_contract",
      claimId: "claim_contract",
      title: "这里可能有你的一席",
      disclosure: "基于当前测试样本",
      evidencePanel: {
        relevanceEvidenceIds: ["ev_note_contract"],
        noteSupportEvidenceIds: ["ev_note_contract"],
        coverageEvidenceIds: ["ev_source_contract"],
      },
      outline: null,
    }],
    evidence: [
      { id: "ev_note_contract", kind: "note_excerpt" as const, text: "先做一个短周期试学实验。", start: 0, end: 12 },
      { id: "ev_source_contract", kind: "source_excerpt" as const, text: "需要按阶段调整", sourceContentId: "src_contract" },
    ],
    warnings: [],
    analyzedAt: "2026-09-02T00:00:00.000Z",
  };
}

describe("Candidate Seat contract", () => {
  it("accepts only a related + supported + limited Candidate", () => {
    assert.equal(analysisResultSchema.safeParse(validResult()).success, true);
  });

  it("rejects a Candidate whose coverage is not limited", () => {
    const result = validResult();
    const invalid = {
      ...result,
      assessments: [{
        ...result.assessments[0],
        coverage: { ...result.assessments[0].coverage, value: "covered" as const },
      }],
    };
    assert.equal(analysisResultSchema.safeParse(invalid).success, false);
  });

  it("rejects missing evidence relations and mismatched note slices", () => {
    const result = validResult();
    const invalid = {
      ...result,
      candidateSeats: [{
        ...result.candidateSeats[0],
        evidencePanel: {
          ...result.candidateSeats[0].evidencePanel,
          coverageEvidenceIds: ["ev_missing"],
        },
      }],
    };
    assert.equal(analysisResultSchema.safeParse(invalid).success, false);

    const clean = analysisResultSchema.parse(validResult());
    assert.notDeepEqual(
      validateAnalysisRelations(clean, "另一段完全不同的笔记文本"),
      [],
    );
  });

  it("allows no_candidate only without a seat", () => {
    const result = validResult();
    const noCandidate = {
      ...result,
      status: "no_candidate" as const,
      assessments: [{
        ...result.assessments[0],
        relevance: { ...result.assessments[0].relevance, value: "uncertain" as const },
        coverage: { ...result.assessments[0].coverage, value: "uncertain" as const },
        decision: "inconclusive" as const,
      }],
      candidateSeats: [],
    };
    assert.equal(analysisResultSchema.safeParse(noCandidate).success, true);
  });
});
