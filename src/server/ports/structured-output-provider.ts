import type { z } from "zod";
import type { GenerationMetadata } from "../../domain/schemas/provider.ts";
import type { ExecutionContext } from "./execution-context.ts";

export interface StructuredOutputProvider {
  generate<T extends z.ZodType>(request: {
    schema: T;
    schemaName: string;
    system: string;
    prompt: string;
    maxOutputTokens: number;
  }, context: ExecutionContext): Promise<{
    data: z.infer<T>;
    metadata: GenerationMetadata;
  }>;
}
