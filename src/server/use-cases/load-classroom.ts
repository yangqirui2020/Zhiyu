import { classroomSchema, type Classroom } from "@/domain/schemas";
import { FixtureClassroomSource } from "@/server/providers/fixture/fixture-classroom-source";
import { loadClassroomBundle } from "../providers/catalog/classroom-bundle";
import type { ExecutionContext } from "@/server/ports/execution-context";

export async function loadClassroom(
  questionId: string,
  context: ExecutionContext,
): Promise<Classroom> {
  context.signal.throwIfAborted();
  if (questionId === "q_learn_programming" && process.env.NODE_ENV !== "production" && process.env.DATA_MODE === "mock") return classroomSchema.parse(await new FixtureClassroomSource().load(questionId));
  return classroomSchema.parse((await loadClassroomBundle(questionId)).classroom);
}
