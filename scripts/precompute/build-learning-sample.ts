import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { snapshotManifestSchema } from "../../src/domain/schemas/snapshot.ts";
import { candidateSampleSchema } from "../../src/domain/schemas/candidate-generation.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
import { prepareLearning, completeLearning } from "../../src/server/pipelines/learning/generate.ts";
import { DeepSeekStructuredOutputProvider } from "../../src/server/providers/deepseek/deepseek-structured-output-provider.ts";
import { generationMetadataSchema } from "../../src/domain/schemas/provider.ts";
import { hashNote } from "../../src/server/pipelines/candidate-seat/analyze.ts";

console.log("Validating current Snapshot");
const bundle = await readSnapshotBundle();
const snapshotId = `snap_zhihu_${new Date().toISOString().replace(/\D/g, "")}`;
const priorRevision = bundle.classroom.revision;
bundle.classroom.revision = snapshotId;
bundle.classroom.provenance.snapshotId = snapshotId;
bundle.narrative.id = `narrative_${snapshotId}`;
const context = () => ({ requestId: `req_${snapshotId}`, signal: new AbortController().signal, deadlineAt: Date.now() + 25_000, mode: "live" as const });
const provider = new DeepSeekStructuredOutputProvider();
console.log("Generating Sample question");
const priorSample = learningSampleSchema.safeParse(bundle.assets["learning/sample.json"]);
const question = priorSample.success && priorSample.data.noteText === bundle.narrative.noteText
  ? { data: priorSample.data.question, metadata: generationMetadataSchema.parse((bundle.assets["learning-generation.json"] as Record<string, unknown>).questionMetadata) }
  : await prepareLearning(bundle.narrative.noteText, bundle.classroom, provider, context());
// An explicit authored Sample reply, not a claimed user response.
const answerText = "我不会因为两周反馈慢就立刻换语言。我会把卡点分为环境配置、基础语法和任务拆分三类，先用可运行模板排除环境问题，再把项目缩成一个输入输出都能检查的小功能。如果同一类基础错误仍反复出现，就暂停扩展项目并补基础；能独立复现核心功能后才继续。";
question.data.seatmate.sampleAnswer = answerText;
console.log("Generating Sample completion");
const completion = await completeLearning(bundle.narrative.noteText, answerText, question.data, bundle.classroom, provider, context());
const candidate = candidateSampleSchema.parse(bundle.assets["analysis/sample.json"]);
const id = createHash("sha256").update(snapshotId + "\0" + candidate.noteText).digest("hex").slice(0, 24);
if (candidate.result.claims.length !== 1) throw new Error("Expected one primary Sample claim");
candidate.result.classroomRevision = snapshotId;
candidate.result.id = `analysis_${id}`;
candidate.result.claims[0].id = `claim_${id}`;
candidate.result.assessments[0].claimId = `claim_${id}`;
for (const seat of candidate.result.candidateSeats) { seat.id = `seat_${id}`; seat.claimId = `claim_${id}`; }
bundle.assets["analysis/sample.json"] = candidateSampleSchema.parse(candidate);
bundle.narrative.seatmate = question.data.seatmate;
bundle.narrative.classNote = completion.data.classNote;
bundle.narrative.mySeat = completion.data.mySeat;
bundle.narrative.zhihuDraft = completion.data.zhihuDraft;
bundle.narrative.disclosure = "真实知乎摘要 · AI 预计算课堂 · 个人结果分别标明模式";
bundle.assets["classroom.json"] = bundle.classroom;
bundle.assets["narrative.json"] = bundle.narrative;
bundle.assets["learning/sample.json"] = learningSampleSchema.parse({ questionId: bundle.classroom.question.id, classroomRevision: snapshotId, noteText: bundle.narrative.noteText, noteHash: hashNote(bundle.narrative.noteText), answerText, replyHash: hashNote(answerText), question: question.data, completion: completion.data, generatedAt: completion.metadata.generatedAt, modelId: completion.metadata.modelId, promptVersion: "learning-v1" });
bundle.assets["learning-generation.json"] = { derivedFrom: priorRevision, unchanged: ["sources", "embeddings", "clusters", "candidate assessment"], candidateRevisionRebound: true, sampleAnswerOrigin: "explicit authored learning example", questionMetadata: question.metadata, completionMetadata: completion.metadata };
console.log("Writing immutable validated assets");
const folder = resolve("data/snapshots/learn-programming", snapshotId);
const checksums: Record<string, string> = {};
for (const [name, data] of Object.entries(bundle.assets)) {
  const bytes = JSON.stringify(data, null, 2) + "\n";
  checksums[name] = createHash("sha256").update(bytes).digest("hex");
  const path = resolve(folder, name); await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes, { flag: "wx" });
}
const manifest = snapshotManifestSchema.parse({ ...bundle.manifest, snapshotId, classroomRevision: snapshotId, generatedAt: new Date().toISOString(), pipelineVersion: "classroom-v1-candidate-v1-learning-v1", checksums });
await writeFile(resolve(folder, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
await writeFile(resolve("data/snapshots/active.json"), JSON.stringify({ questionId: manifest.questionId, path: `learn-programming/${snapshotId}` }, null, 2) + "\n");
await readSnapshotBundle();
console.log(JSON.stringify({ snapshotId, sourceCount: manifest.sourceCount, sampleStages: ["Candidate", "prepared", "completed"], seatmateStudentId: question.data.seatmate.studentId }));
