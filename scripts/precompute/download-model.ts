import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { embeddingDownloadIndexSchema } from "../../src/domain/schemas/classroom-generation.ts";

const index = embeddingDownloadIndexSchema.parse(JSON.parse(await readFile("verification/TASK-021/embedding-model-files.json", "utf8")));
for (const file of index.files) {
  const path = resolve("node_modules/.cache/zhiyu-models/bge-small-zh-v1.5", index.revision, file.file);
  const existing = await readFile(path).catch(() => null);
  if (existing && createHash("sha256").update(existing).digest("hex") === file.sha256) { console.log(`Verified ${file.file}`); continue; }
  const response = await fetch(file.url, { signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Model download failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== file.bytes || createHash("sha256").update(bytes).digest("hex") !== file.sha256) throw new Error(`Model checksum mismatch: ${file.file}`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  console.log(`Downloaded and verified ${file.file}`);
}
