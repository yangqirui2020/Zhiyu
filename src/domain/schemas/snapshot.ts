import { z } from "zod";
import type { Classroom } from "./classroom.ts";

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const relativeAsset = z.string().regex(/^[a-z0-9][a-z0-9/_-]*\.json$/).refine((path) => !path.includes(".."));
export const snapshotManifestSchema = z.object({
  schemaVersion: z.literal("1.0.0-rc.2"),
  snapshotId: z.string().regex(/^snap_[a-z0-9_-]+$/),
  questionId: z.string().regex(/^q_[a-z0-9_-]+$/),
  classroomRevision: z.string().min(1),
  generatedAt: z.iso.datetime(),
  capturedAt: z.iso.datetime(),
  sourceProvider: z.literal("zhihu_question_answers"),
  sourceCount: z.number().int().min(8).max(50),
  fetchedCount: z.number().int().min(8),
  queryHistory: z.array(z.object({ endpoint: z.string().min(1), questionUrl: z.url(), offset: z.number().int().nonnegative(), limit: z.number().int().positive(), capturedAt: z.iso.datetime() })).min(1),
  pipelineVersion: z.string().min(1),
  promptVersions: z.record(z.string().min(1), z.string().min(1)),
  modelVersions: z.record(z.string().min(1), z.string().min(1)),
  embeddingModel: z.object({ id: z.literal("Xenova/bge-small-zh-v1.5"), revision: z.literal("75c43b069aac4d136ba6bc1122f995fedcfd2781"), dimensions: z.literal(512), pooling: z.literal("cls"), normalized: z.literal(true) }),
  clustering: z.object({ algorithm: z.literal("agglomerative"), linkage: z.literal("ward"), distance: z.literal("euclidean"), clusterCount: z.number().int().min(2).max(8), seed: z.number().int().nonnegative() }),
  checksums: z.record(relativeAsset, sha256).refine((checksums) => ["sources.json", "classroom.json", "narrative.json"].every((name) => name in checksums), "Required assets must have checksums"),
  exclusions: z.array(z.object({ externalId: z.string().min(1), reason: z.string().min(1) })),
}).refine((m) => m.sourceCount <= m.fetchedCount && new Date(m.capturedAt) <= new Date(m.generatedAt), "Invalid source count or capture timeline");

export type SnapshotManifest = z.infer<typeof snapshotManifestSchema>;

export function validateSnapshotClassroom(manifest: SnapshotManifest, classroom: Classroom): string[] {
  const issues: string[] = [];
  if (classroom.sources.some(source => source.provider !== "zhihu" || source.textKind === "synthetic_excerpt")) issues.push("Snapshot cannot contain synthetic sources");
  if (classroom.schemaVersion !== manifest.schemaVersion || classroom.question.id !== manifest.questionId || classroom.revision !== manifest.classroomRevision) issues.push("Snapshot identity mismatch");
  if (classroom.sources.length !== manifest.sourceCount) issues.push("Snapshot source count mismatch");
  if (classroom.clusters.length !== manifest.clustering.clusterCount) issues.push("Snapshot cluster count mismatch");
  if (classroom.provenance.mode !== "snapshot" || classroom.provenance.snapshotId !== manifest.snapshotId || classroom.provenance.capturedAt !== manifest.capturedAt) issues.push("Snapshot provenance mismatch");
  return issues;
}
