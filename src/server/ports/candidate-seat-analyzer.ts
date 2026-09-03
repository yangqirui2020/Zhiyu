import type { CandidateSeatRequest } from "@/contracts";
import type { AnalysisResult, Classroom } from "@/domain/schemas";

import type { ExecutionContext } from "./execution-context.ts";

export interface CandidateSeatAnalyzer {
  analyze(
    request: CandidateSeatRequest,
    classroom: Classroom,
    context: ExecutionContext,
  ): Promise<AnalysisResult>;
}
