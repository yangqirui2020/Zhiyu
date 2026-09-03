import type { Classroom } from "@/domain/schemas";

import type { ExecutionContext } from "./execution-context.ts";

export interface ClassroomSource {
  load(questionId: string, context: ExecutionContext): Promise<Classroom>;
}
