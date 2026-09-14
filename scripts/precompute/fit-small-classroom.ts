import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { classroomSchema } from "../../src/domain/schemas/classroom.ts";
import { snapshotManifestSchema } from "../../src/domain/schemas/snapshot.ts";

const bundle = await readSnapshotBundle();
if (bundle.classroom.clusters.length !== 2) throw new Error("This fit only applies to the verified two-group classroom");
const snapshotId = `snap_zhihu_${new Date().toISOString().replace(/\D/g, "")}`;
const folder = resolve("data/snapshots/learn-programming", snapshotId);
await mkdir(folder, { recursive: true });
for (const group of bundle.classroom.clusters) {
  const dy = 25 - group.layout.centerY;
  group.layout.centerY = 25;
  for (const student of bundle.classroom.students.filter((s) => group.studentIds.includes(s.id))) student.layout.y += dy;
}
bundle.classroom.revision = snapshotId;
bundle.classroom.provenance.snapshotId = snapshotId;
bundle.narrative.id = `narrative_${snapshotId}`;
classroomSchema.parse(bundle.classroom);
bundle.assets["classroom.json"] = bundle.classroom;
bundle.assets["narrative.json"] = bundle.narrative;
bundle.assets["layout-review.json"] = { derivedFrom: bundle.manifest.snapshotId, reason: "Keep all seats above the existing mobile context panel", centerY: 25, modelGenerationUnchanged: true };
const checksums: Record<string, string> = {};
for (const [name, data] of Object.entries(bundle.assets)) {
  const bytes = JSON.stringify(data, null, 2) + "\n";
  checksums[name] = createHash("sha256").update(bytes).digest("hex");
  await writeFile(resolve(folder, name), bytes, { flag: "wx" });
}
const manifest = snapshotManifestSchema.parse({ ...bundle.manifest, snapshotId, classroomRevision: snapshotId, generatedAt: new Date().toISOString(), pipelineVersion: "classroom-v1-layout-fit", checksums });
await writeFile(resolve(folder, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
await writeFile(resolve("data/snapshots/active.json"), JSON.stringify({ questionId: manifest.questionId, path: `learn-programming/${snapshotId}` }, null, 2) + "\n");
console.log(JSON.stringify({ snapshotId, sourceCount: manifest.sourceCount }));
