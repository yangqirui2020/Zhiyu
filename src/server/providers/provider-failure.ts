import "server-only";
import { AppError } from "../errors/app-error.ts";
import type { ExecutionContext } from "../ports/execution-context.ts";

export function providerSignal(context: ExecutionContext): AbortSignal {
  const remaining = Math.max(0, Math.min(2_147_483_647, Math.floor(context.deadlineAt - Date.now())));
  return AbortSignal.any([context.signal, remaining === 0
    ? AbortSignal.abort(new DOMException("Deadline exceeded", "TimeoutError"))
    : AbortSignal.timeout(remaining)]);
}

export function providerFailure(error: unknown, signal: AbortSignal): AppError {
  if (signal.aborted) return new AppError("PROVIDER_TIMEOUT", "本次处理已取消或超时，请重试。", 504, true, "retry");
  if (error instanceof AppError) return error;
  return new AppError("PROVIDER_UNAVAILABLE", "外部服务暂时不可用，请稍后重试。", 502, true, "retry");
}

export function providerStatusError(status: number): AppError {
  if (status === 429) return new AppError("PROVIDER_RATE_LIMITED", "外部服务调用额度或频率受限，请稍后重试。", 429, true, "retry");
  return new AppError("PROVIDER_UNAVAILABLE", "外部服务暂时不可用，请稍后重试。", 502, true, "retry");
}

export function invalidProviderOutput(): AppError {
  return new AppError("STRUCTURED_OUTPUT_INVALID", "外部服务返回的数据未通过校验，请重试。", 502, true, "retry");
}
