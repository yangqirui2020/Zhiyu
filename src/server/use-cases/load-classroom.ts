import { classroomSchema, type Classroom } from "@/domain/schemas";
import { FixtureClassroomSource } from "@/server/providers/fixture/fixture-classroom-source";
import type { ClassroomSource } from "@/server/ports/classroom-source";
import type { ExecutionContext } from "@/server/ports/execution-context";

const source: ClassroomSource = new FixtureClassroomSource();

export async function loadClassroom(
  questionId: string,
  context: ExecutionContext,
): Promise<Classroom> {
  return classroomSchema.parse(await source.load(questionId, context));
}
