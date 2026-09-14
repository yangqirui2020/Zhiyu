import { z } from "zod";

export const generationMetadataSchema = z.object({
  provider: z.literal("deepseek"),
  modelId: z.string().min(1),
  generatedAt: z.iso.datetime(),
  inputTokens: z.number().int().nonnegative().nullable(),
  outputTokens: z.number().int().nonnegative().nullable(),
});

export const zhihuAnswerPageRequestSchema = z.object({
  questionUrl: z.string().regex(/^https:\/\/www\.zhihu\.com\/question\/[1-9]\d*$/),
  offset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
  limit: z.number().int().min(1).max(50).default(20),
});

export const zhihuAnswerItemSchema = z.object({
  ContentType: z.literal("answer"),
  ContentToken: z.string().regex(/^\d+$/),
  Url: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "www.zhihu.com"
      && /^\/question\/\d+\/answer\/\d+$/.test(url.pathname)
      && !url.username && !url.password;
  }),
  Summary: z.string().min(1).max(100_000),
});

export const zhihuAnswerPageSchema = z.object({
  Items: z.array(zhihuAnswerItemSchema).max(50),
  Paging: z.object({
    IsEnd: z.boolean(),
    NextOffset: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
    Totals: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
  }),
}).superRefine(({ Paging }, ctx) => {
  if (!Paging.IsEnd && Paging.NextOffset === undefined) {
    ctx.addIssue({ code: "custom", message: "Non-final page requires NextOffset", path: ["Paging", "NextOffset"] });
  }
});

export const zhihuTransportEnvelopeSchema = z.object({
  Code: z.number().int(),
  Message: z.string(),
  Data: z.unknown().optional(),
});

export type GenerationMetadata = z.infer<typeof generationMetadataSchema>;
export type ZhihuAnswerPageRequest = z.infer<typeof zhihuAnswerPageRequestSchema>;
export type ZhihuAnswerPage = z.infer<typeof zhihuAnswerPageSchema>;

export const embeddingRequestSchema = z.object({ texts: z.array(z.string().min(1).max(5000)).min(1).max(50) });
export const embeddingResultSchema = z.object({
  vectors: z.array(z.array(z.number().finite()).length(512)).min(1).max(50),
  modelId: z.literal("Xenova/bge-small-zh-v1.5"),
  revision: z.literal("75c43b069aac4d136ba6bc1122f995fedcfd2781"),
  dimensions: z.literal(512),
  normalized: z.literal(true),
}).superRefine(({ vectors }, ctx) => {
  for (const vector of vectors) {
    if (Math.abs(Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0)) - 1) > 0.001) {
      ctx.addIssue({ code: "custom", message: "Vector must be L2 normalized" });
    }
  }
});
export type EmbeddingRequest = z.infer<typeof embeddingRequestSchema>;
export type EmbeddingResult = z.infer<typeof embeddingResultSchema>;
