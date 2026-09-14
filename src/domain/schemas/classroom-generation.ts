import { z } from "zod";
import { argumentDraftSchema } from "./classroom.ts";

export const argumentExtractionSchema = z.object({
  usable: z.boolean(), reason: z.string().min(1), argument: argumentDraftSchema.nullable(),
}).refine((result) => result.usable === (result.argument !== null), "Usable argument must be present");
export const groupDescriptionSchema = z.object({
  label: z.string().min(1).max(24), summary: z.string().min(1).max(220),
  commonReasons: z.array(z.string().min(1).max(160)).min(1).max(3),
  limits: z.array(z.string().min(1).max(160)).min(1).max(3),
});
export const activeSnapshotPointerSchema = z.object({ questionId: z.literal("q_learn_programming"), path: z.string().regex(/^learn-programming\/snap_[a-z0-9_-]+$/) });
export const embeddingDownloadIndexSchema = z.object({
  modelId: z.literal("Xenova/bge-small-zh-v1.5"), revision: z.literal("75c43b069aac4d136ba6bc1122f995fedcfd2781"),
  files: z.array(z.object({ file: z.enum(["config.json", "tokenizer.json", "tokenizer_config.json", "special_tokens_map.json", "onnx/model_quantized.onnx"]), sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().positive(), url: z.url().refine((url) => url.startsWith("https://hf-mirror.com/Xenova/bge-small-zh-v1.5/resolve/75c43b069aac4d136ba6bc1122f995fedcfd2781/")) })).length(5),
});
