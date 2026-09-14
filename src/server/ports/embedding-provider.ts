import type { EmbeddingRequest, EmbeddingResult } from "../../domain/schemas/provider.ts";
import type { ExecutionContext } from "./execution-context.ts";

export interface EmbeddingProvider {
  embed(request: EmbeddingRequest, context: ExecutionContext): Promise<EmbeddingResult>;
}
