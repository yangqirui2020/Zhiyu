import { z } from "zod";
import { analysisResultSchema, claimAssessmentSchema } from "./candidate.ts";
import { evidenceSchema } from "./classroom.ts";

export const candidateGenerationSchema = z.object({
  claimText: z.string().min(1).max(500),
  noteEvidenceIds: z.array(z.string().regex(/^ev_note_[a-f0-9]+_\d+$/)).min(1).max(8),
  relevance: claimAssessmentSchema.shape.relevance,
  noteSupport: claimAssessmentSchema.shape.noteSupport,
  coverage: claimAssessmentSchema.shape.coverage,
  outline: z.object({ perspective: z.string().min(1).max(300), evidence: z.string().min(1).max(300), structure: z.string().min(1).max(300) }).nullable(),
});
export const candidateSampleSchema = z.object({
  sampleId: z.string().regex(/^sample_[a-z0-9_-]+$/),
  noteHash: z.string().regex(/^[a-f0-9]{64}$/),
  noteText: z.string().min(50).max(8000),
  result: analysisResultSchema,
  noteEvidence: z.array(evidenceSchema),
});
