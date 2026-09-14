// Local precomputation entry point. Never import from a Route Handler.
import { env, pipeline } from "@huggingface/transformers";
import { embeddingRequestSchema } from "../../../domain/schemas/provider.ts";

let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
  if (input.length > 300_000) throw new Error("Embedding input too large");
}
const request = embeddingRequestSchema.parse(JSON.parse(input));
env.allowRemoteModels = false;
env.allowLocalModels = true;
const modelPath = process.argv[2];
if (!modelPath) throw new Error("Missing pinned local model path");
const extractor = await pipeline("feature-extraction", modelPath, { dtype: "q8", device: "cpu", session_options: { intraOpNumThreads: 2 } });
const vectors: number[][] = [];
for (const text of request.texts) {
  const tensor = await extractor(text, { pooling: "cls", normalize: true });
  vectors.push(tensor.tolist()[0]);
}
await extractor.dispose();
process.stdout.write(JSON.stringify({ vectors, modelId: "Xenova/bge-small-zh-v1.5", revision: "75c43b069aac4d136ba6bc1122f995fedcfd2781", dimensions: 512, normalized: true }));
