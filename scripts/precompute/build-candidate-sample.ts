import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { snapshotManifestSchema } from "../../src/domain/schemas/snapshot.ts";
import { candidateSampleSchema } from "../../src/domain/schemas/candidate-generation.ts";
import { LiveCandidateAnalyzer } from "../../src/server/providers/live/live-candidate-analyzer.ts";
import { hashNote } from "../../src/server/pipelines/candidate-seat/analyze.ts";

const bundle = await readSnapshotBundle();
const snapshotId = `snap_zhihu_${new Date().toISOString().replace(/\D/g, "")}`;
bundle.classroom.revision = snapshotId;
bundle.classroom.provenance.snapshotId = snapshotId;
bundle.narrative.id = `narrative_${snapshotId}`;
const result = await new LiveCandidateAnalyzer().analyze({
  schemaVersion: bundle.classroom.schemaVersion, questionId: bundle.classroom.question.id,
  classroomRevision: snapshotId, noteText: bundle.narrative.noteText, idempotencyKey: `precompute_${snapshotId}`,
}, bundle.classroom, { requestId: `req_${snapshotId}`, signal: new AbortController().signal, deadlineAt: Date.now() + 60_000, mode: "live" });
if (result.status !== "success") throw new Error(`Sample did not satisfy Candidate guard: ${JSON.stringify(result.assessments)}`);
bundle.assets["classroom.json"] = bundle.classroom;
bundle.assets["narrative.json"] = bundle.narrative;
bundle.assets["analysis/sample.json"] = candidateSampleSchema.parse({
  sampleId: "sample_learn_programming_v1", noteText: bundle.narrative.noteText, noteHash: hashNote(bundle.narrative.noteText), result,
  noteEvidence: result.evidence.filter((item) => item.kind === "note_excerpt"),
});
bundle.assets["candidate-generation.json"] = { derivedFrom: bundle.manifest.snapshotId, model: process.env.STRUCTURED_OUTPUT_MODEL, promptVersion: "candidate-v1", generatedAt: result.analyzedAt, classroomGenerationUnchanged: true };
const folder = resolve("data/snapshots/learn-programming", snapshotId);
const checksums: Record<string, string> = {};
for (const [name, data] of Object.entries(bundle.assets)) {
  const bytes = JSON.stringify(data, null, 2) + "\n";
  checksums[name] = createHash("sha256").update(bytes).digest("hex");
  const path = resolve(folder, name);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes, { flag: "wx" });
}
const manifest = snapshotManifestSchema.parse({ ...bundle.manifest, snapshotId, classroomRevision: snapshotId, generatedAt: new Date().toISOString(), pipelineVersion: "classroom-v1-candidate-v1", checksums });
await writeFile(resolve(folder, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
await writeFile(resolve("data/snapshots/active.json"), JSON.stringify({ questionId: manifest.questionId, path: `learn-programming/${snapshotId}` }, null, 2) + "\n");
await readSnapshotBundle();
console.log(JSON.stringify({ snapshotId, sourceCount: manifest.sourceCount, sampleStatus: result.status }));
