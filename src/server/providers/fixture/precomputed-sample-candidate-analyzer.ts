import { learnProgrammingDemoV3Scenario } from "../../../../data/fixtures/scenarios/learn-programming-demo-v3.ts";
import type { CandidateSeatRequest } from "@/contracts";
import {
  analysisResultSchema,
  validateAnalysisRelations,
  type AnalysisResult,
  type Classroom,
  type Evidence,
} from "@/domain/schemas";
import { AppError } from "@/server/errors/app-error";
import type { CandidateSeatAnalyzer } from "@/server/ports/candidate-seat-analyzer";
import type { ExecutionContext } from "@/server/ports/execution-context";

export const LEARN_PROGRAMMING_SAMPLE_ID = "sample_learn_programming_v1";

function normalizeNote(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}
function noteEvidence(noteText: string): Evidence {
  return {
    id: "ev_note_learn_programming_v1",
    kind: "note_excerpt",
    text: noteText,
    start: 0,
    end: noteText.length,
  };
}

function sourceEvidence(classroom: Classroom, id: string): Evidence {
  const evidence = classroom.evidence.find((item) => item.id === id);
  if (!evidence) {
    throw new AppError(
      "ANALYSIS_INCOMPLETE",
      "演示分析缺少可回溯证据。",
      422,
      false,
      "none",
    );
  }
  return evidence;
}

export class PrecomputedSampleCandidateAnalyzer implements CandidateSeatAnalyzer {
  async analyze(
    request: CandidateSeatRequest,
    classroom: Classroom,
    context: ExecutionContext,
  ): Promise<AnalysisResult> {
    if (request.questionId !== classroom.question.id) {
      throw new AppError("QUESTION_NOT_FOUND", "问题与当前教室不匹配。", 404, false, "switch_question");
    }
    if (request.classroomRevision !== classroom.revision) {
      throw new AppError(
        "CLASSROOM_REVISION_MISMATCH",
        "教室数据已经更新，请重新加载后再试。",
        409,
        true,
        "retry",
      );
    }
    if (context.signal.aborted || Date.now() > context.deadlineAt) {
      throw new AppError("PROVIDER_TIMEOUT", "分析请求已超时。", 504, true, "retry");
    }

    const submittedEvidence = noteEvidence(request.noteText);
    const sampleMatches =
      request.sampleId === LEARN_PROGRAMMING_SAMPLE_ID &&
      normalizeNote(request.noteText) === normalizeNote(learnProgrammingDemoV3Scenario.noteText);

    if (!sampleMatches) {
      const result = {
        schemaVersion: "1.0.0-rc.1",
        id: `analysis_${context.requestId.replace(/[^a-z0-9_-]/gi, "_").toLowerCase()}`,
        questionId: classroom.question.id,
        classroomRevision: classroom.revision,
        status: "no_candidate",
        claims: [{
          id: "claim_submitted_note",
          text: request.noteText,
          normalizedText: normalizeNote(request.noteText),
          noteEvidenceIds: [submittedEvidence.id],
        }],
        assessments: [{
          claimId: "claim_submitted_note",
          relevance: {
            value: "uncertain",
            evidenceIds: [submittedEvidence.id],
            explanation: "当前 Mock Analyzer 不能可靠判断任意观点与问题的关系。",
          },
          noteSupport: {
            value: "supported",
            evidenceIds: [submittedEvidence.id],
            explanation: "这段观点确实来自本次提交的文本。",
          },
          coverage: {
            value: "uncertain",
            evidenceIds: [submittedEvidence.id],
            explanation: "当前 Mock Analyzer 没有为任意观点准备覆盖度判断。",
          },
          decision: "inconclusive",
        }],
        candidateSeats: [],
        evidence: [submittedEvidence],
        warnings: ["当前为 Mock Analyzer；只有显式示例可以使用预计算 Candidate。"],
        analyzedAt: new Date().toISOString(),
      } satisfies AnalysisResult;
      return analysisResultSchema.parse(result);
    }

    const coverageEvidence = [
      sourceEvidence(classroom, "ev_mock_33"),
      sourceEvidence(classroom, "ev_mock_40"),
    ];
    const result = {
      schemaVersion: "1.0.0-rc.1",
      id: `analysis_${context.requestId.replace(/[^a-z0-9_-]/gi, "_").toLowerCase()}`,
      questionId: classroom.question.id,
      classroomRevision: classroom.revision,
      status: "success",
      claims: [{
        id: "claim_learn_programming_experiment",
        text: learnProgrammingDemoV3Scenario.claimTitle,
        normalizedText: normalizeNote(learnProgrammingDemoV3Scenario.claimTitle),
        noteEvidenceIds: [submittedEvidence.id],
      }],
      assessments: [{
        claimId: "claim_learn_programming_experiment",
        relevance: {
          value: "related",
          evidenceIds: [submittedEvidence.id],
          explanation: "直接回应第一门语言如何选择，并提出可执行的试学方法。",
        },
        noteSupport: {
          value: "supported",
          evidenceIds: [submittedEvidence.id],
          explanation: "提交文本明确表达先建立反馈、短期试学并按结果调整路线。",
        },
        coverage: {
          value: "limited",
          evidenceIds: coverageEvidence.map((item) => item.id),
          explanation: "当前样本讨论了因人调整，但较少把选择过程写成带退出条件的实验。",
        },
        decision: "candidate",
      }],
      candidateSeats: [{
        id: "seat_learn_programming_experiment",
        claimId: "claim_learn_programming_experiment",
        title: "这里可能有你的一席",
        disclosure: `基于当前检索到的 ${new Set(classroom.sources.map((source) => source.id)).size} 条 Mock 来源、${classroom.clusters.length} 个观点簇的对比`,
        evidencePanel: {
          relevanceEvidenceIds: [submittedEvidence.id],
          noteSupportEvidenceIds: [submittedEvidence.id],
          coverageEvidenceIds: coverageEvidence.map((item) => item.id),
        },
        outline: {
          perspective: learnProgrammingDemoV3Scenario.mySeat.viewpoint,
          evidence: learnProgrammingDemoV3Scenario.mySeat.reasons,
          structure: learnProgrammingDemoV3Scenario.zhihuDraft.outline[2].text,
        },
      }],
      evidence: [submittedEvidence, ...coverageEvidence],
      warnings: ["预计算 Sample Candidate；不代表任意笔记的实时分析。"],
      analyzedAt: new Date().toISOString(),
    } satisfies AnalysisResult;

    const parsed = analysisResultSchema.parse(result);
    const relationIssues = validateAnalysisRelations(parsed, request.noteText);
    if (relationIssues.length > 0) {
      throw new AppError("ANALYSIS_INCOMPLETE", relationIssues[0], 422, false, "none");
    }
    return parsed;
  }
}
