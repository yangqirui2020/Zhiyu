import "server-only";
import { createHash } from "node:crypto";
import type { LearningTurnProvider } from "../../ports/learning-turn-provider.ts";
import { learningTurnResultSchema, type LearningTurnRequest } from "../../../domain/schemas/learning.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { loadSnapshotBundle } from "../snapshot/snapshot-bundle.ts";
import { DeepSeekStructuredOutputProvider } from "../deepseek/deepseek-structured-output-provider.ts";
import { prepareLearning, completeLearning } from "../../pipelines/learning/generate.ts";
import { signChallenge, verifyChallenge } from "../../pipelines/learning/challenge-token.ts";
import { hashNote } from "../../pipelines/candidate-seat/analyze.ts";
import { AppError } from "../../errors/app-error.ts";

export class LiveLearningTurnProvider implements LearningTurnProvider {
  async run(request: LearningTurnRequest, context: ExecutionContext) {
    const { classroom } = await loadSnapshotBundle(request.questionId);
    const identity = { schemaVersion: "1.0.0-rc.2" as const, questionId: classroom.question.id, classroomRevision: classroom.revision };
    if (request.classroomRevision !== classroom.revision) throw new AppError("CLASSROOM_REVISION_MISMATCH", "课堂资料已更新，请重新开始这节课。", 409, false, "switch_question");
    const provider = new DeepSeekStructuredOutputProvider();
    if (request.stage === "prepare") {
      const { data: question } = await prepareLearning(request.noteText, classroom, provider, context);
      const challengeToken = signChallenge({ ...identity, noteHash: hashNote(request.noteText), expiresAt: Date.now() + 3_600_000, question });
      return learningTurnResultSchema.parse({ ...identity, ...question, stage: "prepared", challengeToken });
    }
    const payload = verifyChallenge(request.challengeToken);
    if (payload.questionId !== request.questionId || payload.classroomRevision !== classroom.revision || payload.noteHash !== hashNote(request.noteText)) throw new AppError("INVALID_INPUT", "追问与当前观点不匹配，请重新开始。", 400, false, "none");
    const { data } = await completeLearning(request.noteText, request.answerText, payload.question, classroom, provider, context);
    const id = `learning_${createHash("sha256").update(request.challengeToken + "\0" + request.answerText).digest("hex").slice(0, 24)}`;
    return learningTurnResultSchema.parse({ ...identity, ...data, stage: "completed", id });
  }
}
