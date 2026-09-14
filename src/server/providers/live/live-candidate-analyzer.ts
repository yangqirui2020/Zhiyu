import "server-only";
import type { CandidateSeatAnalyzer } from "../../ports/candidate-seat-analyzer.ts";
import type { CandidateSeatRequest } from "../../../contracts/api.ts";
import type { Classroom } from "../../../domain/schemas/index.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { DeepSeekStructuredOutputProvider } from "../deepseek/deepseek-structured-output-provider.ts";
import { analyzeAgainstClassroom } from "../../pipelines/candidate-seat/analyze.ts";

export class LiveCandidateAnalyzer implements CandidateSeatAnalyzer {
  async analyze(request: CandidateSeatRequest, classroom: Classroom, context: ExecutionContext) {
    return analyzeAgainstClassroom(request, classroom, new DeepSeekStructuredOutputProvider(), context);
  }
}
