import { classroomSchema, type Classroom } from "@/domain/schemas";
import { FixtureClassroomSource } from "@/server/providers/fixture/fixture-classroom-source";
import { SnapshotClassroomSource } from "../providers/snapshot/snapshot-classroom-source";
import type { ClassroomSource } from "@/server/ports/classroom-source";
import type { ExecutionContext } from "@/server/ports/execution-context";

const source: ClassroomSource = process.env.NODE_ENV !== "production" && process.env.DATA_MODE === "mock"
  ? new FixtureClassroomSource() : new SnapshotClassroomSource();

export async function loadClassroom(
  questionId: string,
  context: ExecutionContext,
): Promise<Classroom> {
  return classroomSchema.parse(await source.load(questionId, context));
}
