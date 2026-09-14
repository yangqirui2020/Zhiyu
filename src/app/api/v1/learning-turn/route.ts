import { ZodError } from "zod";
import { learningTurnRequestSchema, learningApiSuccessSchema, apiFailureSchema } from "@/contracts";
import { AppError, toAppError } from "@/server/errors/app-error";
import { runLearningTurn } from "@/server/use-cases/run-learning-turn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) throw new AppError("INVALID_INPUT", "请求必须使用 JSON。", 400, false, "edit_input");
    if (Number(request.headers.get("content-length") ?? "0") > 49_152) throw new AppError("PAYLOAD_TOO_LARGE", "提交内容过长。", 413, false, "edit_input");
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 49_152) throw new AppError("PAYLOAD_TOO_LARGE", "提交内容过长。", 413, false, "edit_input");
    const input = learningTurnRequestSchema.parse(JSON.parse(rawBody));
    const result = await runLearningTurn(input, { requestId, signal: request.signal, deadlineAt: Date.now() + 25_000, mode: "live" });
    return Response.json(learningApiSuccessSchema.parse(result), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const appError = error instanceof ZodError || error instanceof SyntaxError ? new AppError("INVALID_INPUT", "提交内容未通过校验。", 400, false, "edit_input") : toAppError(error);
    return Response.json(apiFailureSchema.parse({ ok: false, error: { requestId, code: appError.code, message: appError.message, retryable: appError.retryable, recovery: appError.recovery } }), { status: appError.status, headers: { "Cache-Control": "no-store" } });
  }
}
