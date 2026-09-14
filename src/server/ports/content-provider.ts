import type { ZhihuAnswerPage, ZhihuAnswerPageRequest } from "../../domain/schemas/provider.ts";
import type { ExecutionContext } from "./execution-context.ts";

export interface ContentProvider {
  getQuestionAnswers(request: ZhihuAnswerPageRequest, context: ExecutionContext): Promise<ZhihuAnswerPage>;
}
