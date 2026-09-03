import { z } from "zod";

import { evidenceSchema } from "./classroom.ts";
import { schemaVersionSchema } from "./common.ts";

const stableId = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}_[a-z0-9][a-z0-9_-]*$`));

export const claimSchema = z.object({
  id: stableId("claim"),
  text: z.string().min(1),
  normalizedText: z.string().min(1),
  noteEvidenceIds: z.array(stableId("ev")).min(1),
});

const dimensionSchema = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    evidenceIds: z.array(stableId("ev")).min(1),
    explanation: z.string().min(1),
  });

export const claimAssessmentSchema = z.object({
  claimId: stableId("claim"),
  relevance: dimensionSchema(z.enum(["related", "unrelated", "uncertain"])),
  noteSupport: dimensionSchema(z.enum(["supported", "insufficient", "uncertain"])),
  coverage: dimensionSchema(z.enum(["covered", "partial", "limited", "uncertain"])),
  decision: z.enum(["candidate", "not_candidate", "inconclusive"]),
});

export const candidateSeatSchema = z.object({
  id: stableId("seat"),
  claimId: stableId("claim"),
  title: z.string().min(1),
  disclosure: z.string().min(1),
  evidencePanel: z.object({
    relevanceEvidenceIds: z.array(stableId("ev")).min(1),
    noteSupportEvidenceIds: z.array(stableId("ev")).min(1),
    coverageEvidenceIds: z.array(stableId("ev")).min(1),
  }),
  outline: z
    .object({
      perspective: z.string().min(1),
      evidence: z.string().min(1),
      structure: z.string().min(1),
    })
    .nullable(),
});

const analysisResultShapeSchema = z.object({
  schemaVersion: schemaVersionSchema,
  id: stableId("analysis"),
  questionId: stableId("q"),
  classroomRevision: z.string().min(1),
  status: z.enum(["success", "partial", "no_candidate"]),
  claims: z.array(claimSchema).min(1),
  assessments: z.array(claimAssessmentSchema).min(1),
  candidateSeats: z.array(candidateSeatSchema),
  evidence: z.array(evidenceSchema).min(1),
  warnings: z.array(z.string()),
  analyzedAt: z.iso.datetime(),
});

type AnalysisResultShape = z.infer<typeof analysisResultShapeSchema>;

export function isCandidateAssessment(
  assessment: z.infer<typeof claimAssessmentSchema>,
): boolean {
  return (
    assessment.relevance.value === "related" &&
    assessment.noteSupport.value === "supported" &&
    assessment.coverage.value === "limited" &&
    assessment.decision === "candidate"
  );
}

export function validateAnalysisRelations(
  result: AnalysisResultShape,
  noteText?: string,
): string[] {
  const issues: string[] = [];
  const claimIds = new Set(result.claims.map((claim) => claim.id));
  const evidenceById = new Map(result.evidence.map((item) => [item.id, item]));
  const assessmentByClaim = new Map(
    result.assessments.map((assessment) => [assessment.claimId, assessment]),
  );
  const seatIds = new Set(result.candidateSeats.map((seat) => seat.id));
  const seatClaimIds = new Set(result.candidateSeats.map((seat) => seat.claimId));

  if (claimIds.size !== result.claims.length) issues.push("Claim ids must be unique");
  if (evidenceById.size !== result.evidence.length) issues.push("Evidence ids must be unique");
  if (assessmentByClaim.size !== result.assessments.length) {
    issues.push("Each claim may have only one assessment");
  }
  if (seatIds.size !== result.candidateSeats.length) issues.push("Seat ids must be unique");
  if (seatClaimIds.size !== result.candidateSeats.length) {
    issues.push("Each Candidate claim may have only one seat");
  }

  for (const claim of result.claims) {
    if (!assessmentByClaim.has(claim.id)) issues.push(`Claim ${claim.id} has no assessment`);
    for (const evidenceId of claim.noteEvidenceIds) {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence || evidence.kind !== "note_excerpt") {
        issues.push(`Claim ${claim.id} has invalid note evidence ${evidenceId}`);
      }
    }
  }

  for (const assessment of result.assessments) {
    if (!claimIds.has(assessment.claimId)) {
      issues.push(`Assessment references missing claim ${assessment.claimId}`);
    }
    const dimensions = [assessment.relevance, assessment.noteSupport, assessment.coverage];
    for (const dimension of dimensions) {
      for (const evidenceId of dimension.evidenceIds) {
        if (!evidenceById.has(evidenceId)) {
          issues.push(`Assessment references missing evidence ${evidenceId}`);
        }
      }
    }
    if (assessment.decision === "candidate" && !isCandidateAssessment(assessment)) {
      issues.push(`Assessment ${assessment.claimId} violates the Candidate guard`);
    }
    if (isCandidateAssessment(assessment) && !seatClaimIds.has(assessment.claimId)) {
      issues.push(`Candidate assessment ${assessment.claimId} has no seat`);
    }
  }

  for (const seat of result.candidateSeats) {
    const assessment = assessmentByClaim.get(seat.claimId);
    if (!claimIds.has(seat.claimId) || !assessment || !isCandidateAssessment(assessment)) {
      issues.push(`Seat ${seat.id} does not reference a legal Candidate claim`);
    }
    for (const evidenceId of [
      ...seat.evidencePanel.relevanceEvidenceIds,
      ...seat.evidencePanel.noteSupportEvidenceIds,
      ...seat.evidencePanel.coverageEvidenceIds,
    ]) {
      if (!evidenceById.has(evidenceId)) {
        issues.push(`Seat ${seat.id} references missing evidence ${evidenceId}`);
      }
    }
    for (const evidenceId of seat.evidencePanel.noteSupportEvidenceIds) {
      if (evidenceById.get(evidenceId)?.kind !== "note_excerpt") {
        issues.push(`Seat ${seat.id} has invalid note-support evidence ${evidenceId}`);
      }
    }
    for (const evidenceId of seat.evidencePanel.coverageEvidenceIds) {
      if (evidenceById.get(evidenceId)?.kind !== "source_excerpt") {
        issues.push(`Seat ${seat.id} has invalid coverage evidence ${evidenceId}`);
      }
    }
  }

  if (result.status === "success" && result.candidateSeats.length === 0) {
    issues.push("Success must include at least one Candidate Seat");
  }
  if (result.status !== "success" && result.candidateSeats.length > 0) {
    issues.push("Partial/no_candidate cannot include Candidate Seats");
  }

  if (noteText !== undefined) {
    for (const evidence of result.evidence) {
      if (evidence.kind !== "note_excerpt") continue;
      if (evidence.end > noteText.length || noteText.slice(evidence.start, evidence.end) !== evidence.text) {
        issues.push(`Note evidence ${evidence.id} does not match the submitted text`);
      }
    }
  }

  return issues;
}

export const analysisResultSchema = analysisResultShapeSchema.superRefine(
  (result, context) => {
    for (const message of validateAnalysisRelations(result)) {
      context.addIssue({ code: "custom", message });
    }
  },
);

export type Claim = z.infer<typeof claimSchema>;
export type ClaimAssessment = z.infer<typeof claimAssessmentSchema>;
export type CandidateSeat = z.infer<typeof candidateSeatSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
