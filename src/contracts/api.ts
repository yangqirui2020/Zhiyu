import { z } from "zod";

import {
  analysisResultSchema,
  classroomSchema,
  dataModeSchema,
  schemaVersionSchema,
} from "../domain/schemas/index.ts";

export const errorCodeSchema = z.enum([
  "INVALID_INPUT",
  "PAYLOAD_TOO_LARGE",
  "QUESTION_NOT_FOUND",
  "CLASSROOM_REVISION_MISMATCH",
  "INSUFFICIENT_SOURCE_DATA",
  "ANALYSIS_INCOMPLETE",
  "PROVIDER_RATE_LIMITED",
  "PROVIDER_TIMEOUT",
  "PROVIDER_UNAVAILABLE",
  "STRUCTURED_OUTPUT_INVALID",
  "SNAPSHOT_UNAVAILABLE",
  "INTERNAL_ERROR",
]);

export const apiMetaSchema = z
  .object({
    requestId: z.string().min(1),
    mode: dataModeSchema,
    servedAt: z.iso.datetime(),
    snapshotId: z.string().min(1).optional(),
    capturedAt: z.iso.datetime().optional(),
    fallbackFrom: z.literal("live").optional(),
    fallbackReason: z.string().min(1).optional(),
    warnings: z.array(z.string()),
  })
  .superRefine((meta, context) => {
    if (meta.mode === "snapshot" && (!meta.snapshotId || !meta.capturedAt)) {
      context.addIssue({ code: "custom", message: "Snapshot responses require snapshotId and capturedAt" });
    }
    if ((meta.fallbackFrom && !meta.fallbackReason) || (!meta.fallbackFrom && meta.fallbackReason)) {
      context.addIssue({ code: "custom", message: "Fallback source and reason must appear together" });
    }
  });

export const apiFailureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    requestId: z.string().min(1),
    code: errorCodeSchema,
    message: z.string().min(1),
    retryable: z.boolean(),
    recovery: z.enum(["retry", "use_snapshot", "use_sample", "edit_input", "switch_question", "none"]),
  }),
});

export function apiSuccessSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({ ok: z.literal(true), data: dataSchema, meta: apiMetaSchema });
}

export const classroomApiSuccessSchema = apiSuccessSchema(classroomSchema);
export const analysisApiSuccessSchema = apiSuccessSchema(analysisResultSchema);

export const candidateSeatRequestSchema = z.object({
  schemaVersion: schemaVersionSchema,
  questionId: z.string().regex(/^q_[a-z0-9][a-z0-9_-]*$/),
  classroomRevision: z.string().min(1),
  noteText: z.string().min(50).max(8000),
  sampleId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(8).max(128),
});

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ApiMeta = z.infer<typeof apiMetaSchema>;
export type ApiFailure = z.infer<typeof apiFailureSchema>;
export type CandidateSeatRequest = z.infer<typeof candidateSeatRequestSchema>;
export type ApiSuccess<T> = { ok: true; data: T; meta: ApiMeta };
