import { z } from "zod";

export const schemaVersionSchema = z.enum(["1.0.0-rc.1", "1.0.0-rc.2"]);

export const dataModeSchema = z.enum(["live", "snapshot", "sample", "mock"]);

export const provenanceSchema = z.object({
  schemaVersion: schemaVersionSchema,
  mode: dataModeSchema,
  requestId: z.string().min(1),
  servedAt: z.iso.datetime(),
  snapshotId: z.string().min(1).optional(),
  capturedAt: z.iso.datetime().optional(),
  fallbackFrom: z.literal("live").optional(),
  fallbackReason: z.string().min(1).optional(),
  warnings: z.array(z.string()),
});

export type DataMode = z.infer<typeof dataModeSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
