import type { LearningTurnRequest, LearningTurnResult } from "../../domain/schemas/learning.ts";
import type { ExecutionContext } from "./execution-context.ts";

export interface LearningTurnProvider {
  run(request: LearningTurnRequest, context: ExecutionContext): Promise<LearningTurnResult>;
}
