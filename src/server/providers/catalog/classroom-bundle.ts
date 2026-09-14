import "server-only";
import { findClassroom } from "../../../../data/classrooms/catalog.ts";
import { loadSnapshotBundle } from "../snapshot/snapshot-bundle.ts";
import { loadSyntheticClassroomBundle } from "../synthetic/synthetic-classroom-bundle.ts";
import { AppError } from "../../errors/app-error.ts";

export async function loadClassroomBundle(questionId: string) {
  const entry = findClassroom(questionId);
  if (!entry) throw new AppError("QUESTION_NOT_FOUND", "没有找到这间教室。", 404, false, "switch_question");
  return entry.mode === "mock" ? loadSyntheticClassroomBundle(questionId) : loadSnapshotBundle(questionId);
}
