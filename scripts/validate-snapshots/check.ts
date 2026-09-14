import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { classroomCatalog } from "../../data/classrooms/catalog.ts";
import { loadSyntheticClassroomBundle } from "../../src/server/providers/synthetic/synthetic-classroom-bundle.ts";
const { classroom, manifest, narrative } = await readSnapshotBundle();
console.log(JSON.stringify({ ok: true, snapshotId: manifest.snapshotId, sources: classroom.sources.length, clusters: classroom.clusters.length, speakers: narrative.roundtable.speakers.length }));
for (const entry of classroomCatalog.filter(room => room.mode === "mock")) {
  const bundle = loadSyntheticClassroomBundle(entry.questionId);
  console.log(JSON.stringify({ ok: true, questionId: entry.questionId, mode: "mock", sources: bundle.classroom.sources.length, clusters: bundle.classroom.clusters.length }));
}
