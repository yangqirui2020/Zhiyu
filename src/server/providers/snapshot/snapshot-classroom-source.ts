import "server-only";
import type { ClassroomSource } from "../../ports/classroom-source.ts";
import type { ExecutionContext } from "../../ports/execution-context.ts";
import { loadSnapshotBundle } from "./snapshot-bundle.ts";

export class SnapshotClassroomSource implements ClassroomSource {
  async load(questionId: string, context: ExecutionContext) {
    context.signal.throwIfAborted();
    const bundle = await loadSnapshotBundle(questionId);
    context.signal.throwIfAborted();
    return bundle.classroom;
  }
}
