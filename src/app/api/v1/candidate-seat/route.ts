import { ZodError } from "zod";

import {
  analysisApiSuccessSchema,
  apiFailureSchema,
  candidateSeatRequestSchema,
} from "@/contracts";
import { AppError, toAppError } from "@/server/errors/app-error";
import { analyzeCandidateSeat } from "@/server/use-cases/analyze-candidate-seat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      throw new AppError("INVALID_INPUT", "请求必须使用 JSON。", 400, false, "edit_input");
    }
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (declaredLength > 32_000) {
      throw new AppError("PAYLOAD_TOO_LARGE", "提交内容过长。", 413, false, "edit_input");
    }
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 32_000) {
      throw new AppError("PAYLOAD_TOO_LARGE", "提交内容过长。", 413, false, "edit_input");
    }
    const input = candidateSeatRequestSchema.parse(JSON.parse(rawBody));
    const result = await analyzeCandidateSeat(input, {
      requestId,
      signal: request.signal,
      deadlineAt: Date.now() + 10_000,
      mode: input.sampleId ? "sample" : "mock",
    });
    const responseMode = result.status === "success" && input.sampleId ? "sample" : "mock";
    const body = analysisApiSuccessSchema.parse({
      ok: true,
      data: result,
      meta: {
        requestId,
        mode: responseMode,
        servedAt: new Date().toISOString(),
        warnings: result.warnings,
      },
    });
    return Response.json(body);
  } catch (error) {
    const appError =
      error instanceof ZodError || error instanceof SyntaxError
        ? new AppError("INVALID_INPUT", "提交内容未通过校验。", 400, false, "edit_input")
        : toAppError(error);
    const body = apiFailureSchema.parse({
      ok: false,
      error: {
        requestId,
        code: appError.code,
        message: appError.message,
        retryable: appError.retryable,
        recovery: appError.recovery,
      },
    });
    return Response.json(body, { status: appError.status });
  }
}
