import { mockClassroomFixture } from "../../../../data/fixtures/classrooms/learn-programming.ts";
import { classroomSchema, type Classroom } from "@/domain/schemas";
import { AppError } from "@/server/errors/app-error";
import type { ClassroomSource } from "@/server/ports/classroom-source";

export class FixtureClassroomSource implements ClassroomSource {
  async load(questionId: string): Promise<Classroom> {
    if (questionId !== mockClassroomFixture.question.id) {
      throw new AppError(
        "QUESTION_NOT_FOUND",
        "没有找到这间教室。",
        404,
        false,
        "switch_question",
      );
    }
    return classroomSchema.parse(structuredClone(mockClassroomFixture));
  }
}
