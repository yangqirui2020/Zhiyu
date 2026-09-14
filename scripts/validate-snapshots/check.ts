import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
const { classroom, manifest, narrative } = await readSnapshotBundle();
console.log(JSON.stringify({ ok: true, snapshotId: manifest.snapshotId, sources: classroom.sources.length, clusters: classroom.clusters.length, speakers: narrative.roundtable.speakers.length }));
