import type { ErrorCode } from "@/contracts";

export type Recovery =
  | "retry"
  | "use_snapshot"
  | "use_sample"
  | "edit_input"
  | "switch_question"
  | "none";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
    public readonly recovery: Recovery,
  ) {
    super(message);
    this.name = "AppError";
  }
}
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError(
    "INTERNAL_ERROR",
    "服务暂时无法完成这次请求。",
    500,
    true,
    "retry",
  );
}
