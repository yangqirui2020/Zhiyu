import "server-only";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { APICallError, generateText, NoObjectGeneratedError, NoOutputGeneratedError, Output } from "ai";
import type { z } from "zod";
import { generationMetadataSchema } from "../../../domain/schemas/provider.ts";
import type { StructuredOutputProvider } from "../../ports/structured-output-provider.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { invalidProviderOutput, providerFailure, providerSignal, providerStatusError } from "../provider-failure.ts";

// A provider or transport may fail to settle after cancellation. Keep our boundary bounded.
function untilAbort<T>(operation: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => { signal.removeEventListener("abort", abort); reject(signal.reason); };
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(operation).then(
      (value) => { signal.removeEventListener("abort", abort); resolve(value); },
      (error) => { signal.removeEventListener("abort", abort); reject(error); },
    );
    if (signal.aborted) abort();
  });
}

export class DeepSeekStructuredOutputProvider implements StructuredOutputProvider {
  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly baseURL: string;
  private readonly transport: typeof fetch;

  constructor(options: { apiKey?: string; modelId?: string; baseURL?: string; fetch?: typeof fetch } = {}) {
    this.apiKey = options.apiKey ?? process.env.STRUCTURED_OUTPUT_API_KEY ?? "";
    this.modelId = options.modelId ?? process.env.STRUCTURED_OUTPUT_MODEL ?? "";
    this.baseURL = options.baseURL ?? process.env.STRUCTURED_OUTPUT_BASE_URL ?? "https://api.deepseek.com";
    this.transport = options.fetch ?? fetch;
  }

  async generate<T extends z.ZodType>(request: {
    schema: T; schemaName: string; system: string; prompt: string; maxOutputTokens: number;
  }, context: ExecutionContext) {
    const signal = providerSignal(context);
    try {
      signal.throwIfAborted();
      if (!this.apiKey || !this.modelId || !/^https:\/\/api\.deepseek\.com(?:\/v1)?\/?$/.test(this.baseURL)) throw providerStatusError(401);
      const provider = createDeepSeek({ apiKey: this.apiKey, baseURL: this.baseURL, fetch: (input, init) => this.transport(input, { ...init, redirect: "error" }) });
      const result = await untilAbort(generateText({
        model: provider(this.modelId),
        system: request.system,
        prompt: request.prompt,
        output: Output.object({ schema: request.schema, name: request.schemaName }),
        maxOutputTokens: request.maxOutputTokens,
        maxRetries: 1,
        abortSignal: signal,
        providerOptions: { deepseek: { thinking: { type: "disabled" } } },
      }), signal);
      signal.throwIfAborted();
      const parsed = request.schema.safeParse(result.output);
      if (!parsed.success || result.finishReason === "length") throw invalidProviderOutput();
      return {
        data: parsed.data,
        metadata: generationMetadataSchema.parse({
          provider: "deepseek", modelId: result.response.modelId, generatedAt: new Date().toISOString(),
          inputTokens: result.usage.inputTokens ?? null, outputTokens: result.usage.outputTokens ?? null,
        }),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) || NoOutputGeneratedError.isInstance(error)) throw providerFailure(invalidProviderOutput(), signal);
      if (APICallError.isInstance(error)) throw providerFailure(providerStatusError(error.statusCode ?? 503), signal);
      throw providerFailure(error, signal);
    }
  }
}
