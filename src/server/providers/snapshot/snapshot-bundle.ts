import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { classroomSchema } from "../../../domain/schemas/classroom.ts";
import { activeSnapshotPointerSchema } from "../../../domain/schemas/classroom-generation.ts";
import { classroomNarrativeSchema, validateNarrativeReferences } from "../../../domain/schemas/narrative.ts";
import { snapshotManifestSchema, validateSnapshotClassroom } from "../../../domain/schemas/snapshot.ts";
import { AppError } from "../../errors/app-error.ts";
import { candidateSampleSchema } from "../../../domain/schemas/candidate-generation.ts";
import { validateAnalysisRelations } from "../../../domain/schemas/candidate.ts";
import { learningSampleSchema } from "../../../domain/schemas/learning-sample.ts";
import { validateLearningReferences } from "../../../domain/schemas/learning.ts";
import { hashNote } from "../../pipelines/candidate-seat/analyze.ts";

export async function readSnapshotBundle(root = resolve("data/snapshots")) {
  const pointer = activeSnapshotPointerSchema.parse(JSON.parse(await readFile(resolve(root, "active.json"), "utf8")));
  const folder = resolve(root, pointer.path);
  const manifest = snapshotManifestSchema.parse(JSON.parse(await readFile(resolve(folder, "manifest.json"), "utf8")));
  const assets: Record<string, unknown> = {};
  for (const [name, checksum] of Object.entries(manifest.checksums)) {
    const bytes = await readFile(resolve(folder, name));
    if (createHash("sha256").update(bytes).digest("hex") !== checksum) throw new Error(`Snapshot checksum mismatch: ${name}`);
    assets[name] = JSON.parse(bytes.toString("utf8"));
  }
  const classroom = classroomSchema.parse(assets["classroom.json"]);
  const narrative = classroomNarrativeSchema.parse(assets["narrative.json"]);
  const issues = [...validateSnapshotClassroom(manifest, classroom), ...validateNarrativeReferences(narrative, classroom)];
  if (pointer.questionId !== classroom.question.id || !pointer.path.endsWith(manifest.snapshotId)) issues.push("Snapshot pointer mismatch");
  if (JSON.stringify(assets["sources.json"]) !== JSON.stringify(classroom.sources)) issues.push("Snapshot source asset mismatch");
  if (assets["analysis/sample.json"]) {
    const sample = candidateSampleSchema.parse(assets["analysis/sample.json"]);
    if (sample.noteText !== narrative.noteText || sample.noteHash !== hashNote(sample.noteText) || sample.result.questionId !== classroom.question.id || sample.result.classroomRevision !== classroom.revision) issues.push("Candidate Sample identity mismatch");
    issues.push(...validateAnalysisRelations(sample.result, sample.noteText));
    for (const e of sample.result.evidence.filter((e) => e.kind === "source_excerpt")) {
      if (!classroom.evidence.some((original) => JSON.stringify(original) === JSON.stringify(e))) issues.push("Candidate source differs from classroom");
    }
  }
  if (assets["learning/sample.json"]) {
    const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
    if (sample.noteText !== narrative.noteText || sample.noteHash !== hashNote(sample.noteText) || sample.replyHash !== hashNote(sample.answerText) || sample.questionId !== classroom.question.id || sample.classroomRevision !== classroom.revision) issues.push("Learning Sample identity mismatch");
    issues.push(...validateLearningReferences(sample.question, classroom), ...validateLearningReferences(sample.completion, classroom));
  }
  if (issues.length) throw new Error(issues.join("; "));
  return { manifest, classroom, narrative, assets };
}

let cached: ReturnType<typeof readSnapshotBundle> | null = null;
export async function loadSnapshotBundle(questionId: string) {
  if (questionId !== "q_learn_programming") throw new AppError("QUESTION_NOT_FOUND", "没有找到这间教室。", 404, false, "switch_question");
  cached ??= readSnapshotBundle().catch(() => { cached = null; throw new AppError("SNAPSHOT_UNAVAILABLE", "课堂资料未通过校验，请稍后重试。", 503, true, "retry"); });
  return structuredClone(await cached);
}
