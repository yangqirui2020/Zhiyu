import type { ClaimAssessment } from "../schemas/candidate.ts";

export function canCreateCandidateSeat(assessment: ClaimAssessment): boolean {
  return (
    assessment.relevance.value === "related" &&
    assessment.noteSupport.value === "supported" &&
    assessment.coverage.value === "limited" &&
    assessment.decision === "candidate"
  );
}
