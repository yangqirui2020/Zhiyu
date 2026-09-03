import type { DataMode } from "@/domain/schemas";

export type ExecutionContext = {
  requestId: string;
  signal: AbortSignal;
  deadlineAt: number;
  mode: DataMode;
};
