import { apiFailureSchema, classroomApiSuccessSchema } from "@/contracts";
import { toAppError } from "@/server/errors/app-error";
import { loadClassroom } from "@/server/use-cases/load-classroom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  const requestId = crypto.randomUUID();
  const controller = new AbortController();
  try {
    const { questionId } = await context.params;
    const classroom = await loadClassroom(questionId, {
      requestId,
      signal: controller.signal,
      deadlineAt: Date.now() + 5_000,
      mode: "mock",
    });
    const body = classroomApiSuccessSchema.parse({
      ok: true,
      data: classroom,
      meta: {
        requestId,
        mode: classroom.provenance.mode,
        servedAt: new Date().toISOString(),
        warnings: classroom.provenance.warnings,
      },
    });
    return Response.json(body);
  } catch (error) {
    const appError = toAppError(error);
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
