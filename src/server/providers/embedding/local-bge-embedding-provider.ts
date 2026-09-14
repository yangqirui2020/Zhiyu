import "server-only";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { embeddingRequestSchema, embeddingResultSchema, type EmbeddingRequest } from "../../../domain/schemas/provider.ts";
import type { EmbeddingProvider } from "../../ports/embedding-provider.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { invalidProviderOutput, providerFailure, providerSignal } from "../provider-failure.ts";

export class LocalBgeEmbeddingProvider implements EmbeddingProvider {
  async embed(input: EmbeddingRequest, context: ExecutionContext) {
    const signal = providerSignal(context);
    try {
      signal.throwIfAborted();
      const request = embeddingRequestSchema.parse(input);
      const modelPath = resolve("node_modules/.cache/zhiyu-models/bge-small-zh-v1.5/75c43b069aac4d136ba6bc1122f995fedcfd2781");
      const text = await new Promise<string>((accept, reject) => {
        const child = spawn(process.execPath, [fileURLToPath(new URL("./bge-worker.ts", import.meta.url)), modelPath], {
          signal, windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
          env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: process.env.TEMP, NODE_ENV: process.env.NODE_ENV ?? "development" },
        });
        let output = "";
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (chunk: string) => {
          output += chunk;
          if (output.length > 1_000_000) { child.kill(); reject(invalidProviderOutput()); }
        });
        child.stderr.resume();
        child.on("error", reject);
        child.on("close", (code) => code === 0 ? accept(output) : reject(new Error("Local embedding worker failed")));
        child.stdin.on("error", reject);
        child.stdin.end(JSON.stringify(request));
      });
      signal.throwIfAborted();
      const result = embeddingResultSchema.safeParse(JSON.parse(text));
      if (!result.success || result.data.vectors.length !== request.texts.length) throw invalidProviderOutput();
      return result.data;
    } catch (error) { throw providerFailure(error, signal); }
  }
}
