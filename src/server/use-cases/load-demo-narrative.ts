import { learnProgrammingDemoV3Scenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v3.ts";
import { loadClassroomBundle } from "../providers/catalog/classroom-bundle";
import { classroomCatalog, findClassroom } from "../../../data/classrooms/catalog";

export async function loadDemoNarrative(questionId: string) {
  const entry = findClassroom(questionId);
  if (!entry) return null;
  if (questionId === "q_learn_programming" && process.env.NODE_ENV !== "production" && process.env.DATA_MODE === "mock") return structuredClone(learnProgrammingDemoV3Scenario);
  const { narrative } = await loadClassroomBundle(questionId);
  const next = findClassroom(entry.nextQuestionId)!;
  return { ...narrative, campus: { ...narrative.campus, rooms: classroomCatalog.map(room => ({ number: room.number, title: room.title, status: room.questionId === questionId ? "current" as const : "next" as const, note: room.mode === "mock" ? "合成演示" : "真实摘要" })) }, nextClassroom: { number: next.number, title: next.title, causalNote: entry.connection, statusNote: "已开放，进入后开始一节新的课。" } };
}
