import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mockClassroomFixture } from "../../data/fixtures/classrooms/learn-programming.ts";
import {
  classroomSchema,
  validateClassroomRelations,
  type Classroom,
} from "../../src/domain/schemas/index.ts";

function cloneFixture(): Classroom {
  return structuredClone(mockClassroomFixture);
}

describe("mock Classroom fixture", () => {
  it("contains exactly 40 students in five deterministic clusters", () => {
    assert.equal(mockClassroomFixture.provenance.mode, "mock");
    assert.equal(mockClassroomFixture.provenance.snapshotId, undefined);
    assert.equal(mockClassroomFixture.question.id, "q_learn_programming");
    assert.equal(mockClassroomFixture.students.length, 40);
    assert.equal(mockClassroomFixture.sources.length, 40);
    assert.equal(mockClassroomFixture.arguments.length, 40);
    assert.equal(mockClassroomFixture.evidence.length, 40);
    assert.equal(mockClassroomFixture.clusters.length, 5);
    assert.deepEqual(
      mockClassroomFixture.clusters.map((cluster) => cluster.studentIds.length),
      [8, 8, 8, 8, 8],
    );
    assert.deepEqual(validateClassroomRelations(mockClassroomFixture), []);
  });

  it("places every student close to the declared center of its cluster", () => {
    const clusterById = new Map(
      mockClassroomFixture.clusters.map((cluster) => [cluster.id, cluster]),
    );

    for (const student of mockClassroomFixture.students) {
      assert.equal(student.assignment.kind, "cluster");
      if (student.assignment.kind !== "cluster") continue;
      const cluster = clusterById.get(student.assignment.clusterId);
      assert.ok(cluster);
      const distance = Math.hypot(
        student.layout.x - cluster.layout.centerX,
        student.layout.y - cluster.layout.centerY,
      );
      assert.ok(distance <= 8.1, `${student.id} should remain inside its visual group`);
    }
  });

  it("resolves each student evidenceId to a verified substring of the same source", () => {
    const sourceById = new Map(
      mockClassroomFixture.sources.map((source) => [source.id, source]),
    );
    const argumentById = new Map(
      mockClassroomFixture.arguments.map((argument) => [argument.id, argument]),
    );
    const evidenceById = new Map(
      mockClassroomFixture.evidence.map((item) => [item.id, item]),
    );

    for (const student of mockClassroomFixture.students) {
      const source = sourceById.get(student.sourceContentId);
      const argument = argumentById.get(student.argumentId);
      assert.ok(source);
      assert.ok(argument);
      assert.equal(argument.sourceContentId, source.id);

      for (const evidenceId of argument.evidenceIds) {
        const item = evidenceById.get(evidenceId);
        assert.ok(item);
        assert.equal(item.kind, "source_excerpt");
        if (item.kind !== "source_excerpt") continue;
        assert.equal(item.sourceContentId, source.id);
        assert.equal(source.excerpt.includes(item.text), true);
      }
    }
  });
});

describe("classroomSchema relation validation", () => {
  it("rejects a missing evidence reference", () => {
    const classroom = cloneFixture();
    classroom.arguments[0].evidenceIds[0] = "ev_missing";

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });

  it("rejects evidence borrowed from another source", () => {
    const classroom = cloneFixture();
    classroom.arguments[0].evidenceIds[0] = "ev_mock_02";

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });

  it("rejects evidence text that is not present in its stored excerpt", () => {
    const classroom = cloneFixture();
    classroom.evidence[0].text = "这段不存在于演示摘要中";

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });

  it("rejects a student and cluster backlink mismatch", () => {
    const classroom = cloneFixture();
    classroom.students[0].assignment = {
      kind: "cluster",
      clusterId: "clu_python_momentum",
    };

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });

  it("rejects duplicate provider external source identities", () => {
    const classroom = cloneFixture();
    classroom.sources[1].externalId = classroom.sources[0].externalId;

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });

  it("rejects a source that is not represented by exactly one student", () => {
    const classroom = cloneFixture();
    classroom.students[1].sourceContentId = classroom.students[0].sourceContentId;

    assert.equal(classroomSchema.safeParse(classroom).success, false);
  });
});
