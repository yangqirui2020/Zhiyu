"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Classroom } from "@/domain/schemas";
import { apiFailureSchema, learningApiSuccessSchema } from "@/contracts";
import { experienceInputSchema, experienceNote } from "@/domain/schemas/contribution";
import { contributionReducer, initialContributionState } from "./contribution-machine";

export function useContribution(classroom: Classroom) {
  const [state, dispatch] = useReducer(contributionReducer, { questionId: classroom.question.id, classroomRevision: classroom.revision }, initialContributionState);
  const abortRef = useRef<AbortController | null>(null);
  const cancel = useCallback(() => { abortRef.current?.abort(); abortRef.current = null; }, []);
  useEffect(() => cancel, [cancel]);
  const run = async (stage: "prepare" | "complete") => {
    if (!experienceInputSchema.safeParse(state.input).success) return;
    const prepared = "prepared" in state.flow ? state.flow.prepared : null;
    if (stage === "complete" && (!prepared || state.answer.trim().length < 10)) return;
    cancel();
    const controller = new AbortController(); abortRef.current = controller;
    const requestId = `req_contribution_${crypto.randomUUID().replaceAll("-", "")}`;
    dispatch({ type: stage, requestId });
    try {
      const response = await fetch("/api/v1/learning-turn", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemaVersion: "1.0.0-rc.2", questionId: classroom.question.id, classroomRevision: classroom.revision, noteText: experienceNote(state.input), stage, idempotencyKey: requestId, ...(stage === "complete" ? { answerText: state.answer, challengeToken: prepared!.challengeToken } : {}) }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) { const failure = apiFailureSchema.safeParse(body); throw new Error(failure.success ? failure.data.error.message : "这次整理没有完成，请重试。"); }
      const parsed = learningApiSuccessSchema.safeParse(body);
      if (!parsed.success || parsed.data.meta.mode !== "live") throw new Error("经历整理未获得可核对的实时结果，请重试或自己整理。");
      const result = parsed.data.data;
      if (result.questionId !== classroom.question.id || result.classroomRevision !== classroom.revision || (stage === "prepare" ? result.stage !== "prepared" : result.stage !== "completed")) throw new Error("本次结果与当前经历不匹配，请重试。");
      if (result.stage === "prepared") dispatch({ type: "prepared", requestId, result });
      else dispatch({ type: "completed", requestId, result });
    } catch (error) {
      if (controller.signal.aborted) return;
      dispatch({ type: "failed", requestId, message: error instanceof DOMException && error.name === "TimeoutError" ? "处理用时较长，经历已保留。你可以重试，也可以自己整理。" : error instanceof Error ? error.message : "这次没有完成，经历已保留。" });
    } finally { if (abortRef.current === controller) abortRef.current = null; }
  };
  return { state, dispatch, run, cancel };
}
