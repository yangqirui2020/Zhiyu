import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readSnapshotBundle, loadSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { clusterArguments } from "../../src/server/pipelines/classroom/cluster-arguments.ts";

describe("real snapshot asset integrity", () => {
  it("loads checksum-verified real sources and referenced classroom narrative", async () => {
    const { classroom, manifest, narrative } = await readSnapshotBundle();
    assert.equal(classroom.provenance.mode, "snapshot");
    assert.equal(classroom.sources.length, manifest.sourceCount);
    assert.ok(classroom.sources.length >= 8);
    assert.equal(new Set(classroom.sources.map((s) => s.externalId)).size, classroom.sources.length);
    assert.ok(classroom.sources.every((s) => s.textKind === "answer_summary" && s.url.includes(`/question/${classroom.question.externalId}/answer/`)));
    assert.equal(narrative.roundtable.speakers.length, classroom.clusters.length);
  });

  it("rejects unknown questions and never shares a mutable classroom between requests", async () => {
    await assert.rejects(loadSnapshotBundle("q_missing"), { code: "QUESTION_NOT_FOUND" });
    const first = await loadSnapshotBundle("q_learn_programming");
    first.classroom.sources[0].excerpt = "mutated by caller";
    assert.notEqual((await loadSnapshotBundle("q_learn_programming")).classroom.sources[0].excerpt, "mutated by caller");
  });

  it("recovers two clearly separated normalized vector groups without losing members", () => {
    const vectors = Array.from({ length: 8 }, (_, i) => {
      const angle = i < 4 ? i * 0.01 : 1.4 + (i - 4) * 0.01;
      return [Math.cos(angle), Math.sin(angle)];
    });
    const { selected } = clusterArguments(vectors);
    assert.equal(selected.k, 2);
    assert.deepEqual(selected.groups, [[0, 1, 2, 3], [4, 5, 6, 7]]);
    assert.ok(selected.silhouette > 0.9);
  });
});
