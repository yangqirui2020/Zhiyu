import "server-only";
import { syntheticLessons } from "../../../../data/classrooms/synthetic-lessons.ts";
import { classroomCatalog, findClassroom } from "../../../../data/classrooms/catalog.ts";
import { classroomSchema } from "../../../domain/schemas/classroom.ts";
import { classroomNarrativeSchema, validateNarrativeReferences } from "../../../domain/schemas/narrative.ts";
import { candidateSampleSchema } from "../../../domain/schemas/candidate-generation.ts";
import { validateAnalysisRelations } from "../../../domain/schemas/candidate.ts";
import { learningSampleSchema } from "../../../domain/schemas/learning-sample.ts";
import { validateLearningReferences } from "../../../domain/schemas/learning.ts";
import { hashNote, noteEvidenceFor } from "../../pipelines/candidate-seat/analyze.ts";
import { AppError } from "../../errors/app-error.ts";

const schemaVersion = "1.0.0-rc.2";
const generatedAt = "2026-09-14T20:00:00.000Z";
const disclosure = "合成演示 · 非真实知乎回答";

export function loadSyntheticClassroomBundle(questionId: string) {
  const lesson = syntheticLessons.find(item => item.questionId === questionId);
  const entry = findClassroom(questionId);
  if (!lesson || !entry || entry.mode !== "mock") throw new AppError("QUESTION_NOT_FOUND", "没有找到这间教室。", 404, false, "switch_question");
  const key = questionId.slice(2);
  const id = (prefix: string, index: number) => `${prefix}_synthetic_${key}_${index + 1}`;
  const revision = `synthetic_${key}_v1`;
  const voices = lesson.groups.flatMap((group, groupIndex) => group.voices.map(([conclusion, reason], index) => ({ conclusion, reason, groupIndex, index })));
  const sources = voices.map((voice, index) => ({
    schemaVersion, id: id("src", index), provider: "synthetic", externalId: `synthetic_${key}_${index + 1}`, contentType: "other", questionId,
    title: `合成材料 ${String(index + 1).padStart(2, "0")} · ${lesson.groups[voice.groupIndex].label}`, excerpt: `${voice.conclusion}${voice.reason}`, textKind: "synthetic_excerpt",
    url: `https://example.invalid/synthetic/${key}/${index + 1}`, author: { displayName: "合成观点 · 无真实作者", badge: null, authorityLevel: null }, metrics: { voteUpCount: null, commentCount: null }, capturedAt: generatedAt,
  }));
  const evidence = sources.map((source, index) => ({ id: id("ev", index), kind: "source_excerpt", text: source.excerpt, sourceContentId: source.id }));
  const centers = [{ x: 26, y: 32 }, { x: 74, y: 32 }, { x: 26, y: 70 }, { x: 74, y: 70 }];
  const classroom = classroomSchema.parse({
    schemaVersion, revision,
    question: { schemaVersion, id: questionId, externalId: null, title: entry.title, url: `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(entry.title)}`, searchQueries: [] },
    provenance: { schemaVersion, mode: "mock", requestId: revision, servedAt: generatedAt, warnings: [disclosure, "材料和分组为演示而合成，不代表实际知乎讨论或社会共识。"] },
    sources, evidence,
    arguments: voices.map((voice, index) => ({ schemaVersion, id: id("arg", index), sourceContentId: id("src", index), conclusion: voice.conclusion, reasons: [voice.reason], evidenceIds: [id("ev", index)], qualifiers: [lesson.groups[voice.groupIndex].limit], extraction: { promptVersion: "synthetic-lesson-v1", modelId: "authored-synthetic", generatedAt } })),
    students: voices.map((voice, index) => ({ id: id("stu", index), sourceContentId: id("src", index), argumentId: id("arg", index), assignment: { kind: "cluster", clusterId: id("clu", voice.groupIndex) }, displaySeed: index + Number(entry.number) * 31, layout: { x: centers[voice.groupIndex].x + (voice.index % 3 - 1) * 9, y: centers[voice.groupIndex].y + (voice.index < 3 ? -6 : 6) } })),
    clusters: lesson.groups.map((group, index) => ({ id: id("clu", index), label: group.label, labelKind: "ai_generated", summary: group.summary, commonReasons: [group.summary], studentIds: group.voices.map((_, i) => id("stu", index * 6 + i)), representativeArgumentIds: [id("arg", index * 6)], limits: [group.limit, disclosure, "分组只表达合成论证的主题相近，不表示观点正确或支持率。"], confidence: "medium", renderMode: "clustered", layout: { centerX: centers[index].x, centerY: centers[index].y } })),
    representatives: lesson.groups.map((group, index) => ({ clusterId: id("clu", index), title: `${group.label}课代表`, commonReasons: [group.summary], representativeSourceIds: [id("src", index * 6)], exampleResponses: [{ promptKey: "cross_cluster", text: `${group.summary}但需要注意：${group.limit}`, evidenceIds: [id("ev", index * 6)] }, { promptKey: "out_of_scope", text: "这些合成材料不能证明哪条路线对每个人都有效，也不代表真实知乎用户立场。", evidenceIds: [id("ev", index * 6)] }], disclosure: `${disclosure} · 系统整理的观点组 · 非真实答主` })),
  });
  const next = findClassroom(entry.nextQuestionId)!;
  const referenceIds = [id("ev", lesson.seatmateIndex), id("ev", 0), id("ev", 12)];
  const seatmate = { studentId: id("stu", lesson.seatmateIndex), rationale: lesson.rationale, commonGround: lesson.commonGround, difference: lesson.difference, challenge: lesson.challenge, sampleAnswer: lesson.answer };
  const completion = {
    classNote: { before: lesson.note, heard: referenceIds.map(e => classroom.evidence.find(item => item.id === e)!.text), changed: lesson.answer, after: lesson.after, afterHighlights: [] },
    mySeat: { viewpoint: lesson.claim, reasons: lesson.reasons, addedCondition: lesson.addedCondition, delta: "这份示例回应补充了实施条件；请核对是否符合自己的想法。" },
    zhihuDraft: { title: lesson.claim, outline: lesson.outline.map((text, index) => ({ label: ["观点", "方法", "边界"][index], text })), note: "基于合成材料的示例提纲，供练习表达，不是真实知乎讨论结论。" }, evidenceIds: referenceIds,
  };
  const narrative = classroomNarrativeSchema.parse({
    id: `narrative_${revision}`, disclosure,
    campus: { building: "认知校园 · 编程学习楼", floor: "1F", rooms: classroomCatalog.map(room => ({ number: room.number, title: room.title, status: room.questionId === questionId ? "current" : "next", note: room.mode === "mock" ? "合成演示" : "真实摘要" })) },
    noteText: lesson.note, claimTitle: lesson.claim,
    candidate: { x: 50, y: 87, title: lesson.claim, positionRationale: lesson.coverage, evidence: [], coverageDisclosure: `仅比较本班 24 条合成材料、4 个观点组。` },
    roundtable: { speakers: lesson.groups.map((group, index) => ({ clusterId: id("clu", index), studentId: id("stu", index * 6), line: `${group.voices[0][0]}${group.voices[0][1]}`, evidenceIds: [id("ev", index * 6)] })), facilitation: "合成材料的预设讨论，不是真实答主发言。" },
    blackboard: { consensus: lesson.consensus, controversy: lesson.controversy, openQuestion: lesson.openQuestion }, seatmate, ...completion,
    nextClassroom: { number: next.number, title: next.title, causalNote: entry.connection, statusNote: "已开放，进入后开始一节新的课。" },
  });
  const notes = noteEvidenceFor(lesson.note);
  const noteIds = notes.map(e => e.id);
  const candidateSample = candidateSampleSchema.parse({
    sampleId: entry.sampleId, noteText: lesson.note, noteHash: hashNote(lesson.note), noteEvidence: notes,
    result: { schemaVersion, id: `analysis_${revision}`, questionId, classroomRevision: revision, status: "success", claims: [{ id: `claim_${key}`, text: lesson.claim, normalizedText: lesson.claim, noteEvidenceIds: noteIds }],
      assessments: [{ claimId: `claim_${key}`, relevance: { value: "related", explanation: "示例观点回应本班学习方法问题，提出具体检查方法。", evidenceIds: noteIds }, noteSupport: { value: "supported", explanation: "这条主张在示例笔记中有明确表达，可核对原文字段。", evidenceIds: noteIds }, coverage: { value: "limited", explanation: lesson.coverage, evidenceIds: referenceIds }, decision: "candidate" }],
      candidateSeats: [{ id: `seat_${key}`, claimId: `claim_${key}`, title: "这里可能有你的一席", disclosure: "仅表示在本班 24 条合成材料、4 个观点组中覆盖较少，不代表真实知乎讨论。", evidencePanel: { relevanceEvidenceIds: noteIds, noteSupportEvidenceIds: noteIds, coverageEvidenceIds: referenceIds }, outline: { perspective: lesson.claim, evidence: lesson.reasons, structure: lesson.addedCondition } }],
      evidence: [...notes, ...referenceIds.map(e => classroom.evidence.find(item => item.id === e)!)], warnings: [disclosure, "只为精确示例提供此预设分析，其他输入需要重新分析。"], analyzedAt: generatedAt,
    },
  });
  const learningSample = learningSampleSchema.parse({ questionId, classroomRevision: revision, noteText: lesson.note, noteHash: hashNote(lesson.note), answerText: lesson.answer, replyHash: hashNote(lesson.answer), question: { seatmate, evidenceIds: referenceIds }, completion, generatedAt, modelId: "authored-synthetic", promptVersion: "learning-v1" });
  const issues = [...validateNarrativeReferences(narrative, classroom), ...validateAnalysisRelations(candidateSample.result, lesson.note), ...validateLearningReferences(learningSample.question, classroom), ...validateLearningReferences(learningSample.completion, classroom)];
  if (issues.length) throw new Error(issues.join("; "));
  return { classroom, narrative, manifest: null, assets: { "analysis/sample.json": candidateSample, "learning/sample.json": learningSample } as Record<string, unknown> };
}
