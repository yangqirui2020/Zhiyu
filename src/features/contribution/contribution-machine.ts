import { contributionCardSchema, contributionWordingSchema, experienceInputSchema, type ContributionCard, type ContributionWording, type ExperienceInput } from "../../domain/schemas/contribution.ts";
import type { LearningTurnResult } from "../../domain/schemas/learning.ts";

type Prepared = Extract<LearningTurnResult, { stage: "prepared" }>;
type Completed = Extract<LearningTurnResult, { stage: "completed" }>;
type Review = { wording: ContributionWording; draftWording: ContributionWording | null; preparation: "ai" | "manual"; challenge: string; evidenceIds: string[] };
export type ContributionFlow =
  | { phase: "closed" | "editing" | "published" }
  | { phase: "preparing"; requestId: string }
  | { phase: "challenge"; prepared: Prepared }
  | { phase: "completing"; requestId: string; prepared: Prepared }
  | { phase: "error"; stage: "prepare" | "complete"; message: string; prepared: Prepared | null }
  | ({ phase: "review" } & Review);
export type ContributionState = { questionId: string; classroomRevision: string; input: ExperienceInput; answer: string; flow: ContributionFlow; pausedFlow: ContributionFlow | null; board: ContributionCard | null };
const blankInput = (): ExperienceInput => ({ kind: "experience", origin: "self_report", event: "", action: "", outcome: "" });
export const initialContributionState = (identity: { questionId: string; classroomRevision: string }): ContributionState => ({ questionId: identity.questionId, classroomRevision: identity.classroomRevision, input: blankInput(), answer: "", flow: { phase: "closed" }, pausedFlow: null, board: null });
export type ContributionEvent =
  | { type: "begin" | "close" | "withdraw" | "show_card" | "edit_card" | "manual" | "use_own" | "revise_input" }
  | { type: "edit_input"; key: "event" | "action" | "outcome" | "kind"; value: string }
  | { type: "example"; input: ExperienceInput }
  | { type: "edit_answer"; value: string }
  | { type: "prepare" | "complete"; requestId: string }
  | { type: "prepared"; requestId: string; result: Prepared }
  | { type: "completed"; requestId: string; result: Completed }
  | { type: "failed"; requestId: string; message: string }
  | { type: "edit_wording"; key: keyof ContributionWording; value: string }
  | { type: "confirm"; id: string; at: string };

export function contributionReducer(state: ContributionState, event: ContributionEvent): ContributionState {
  const flow = state.flow;
  switch (event.type) {
    case "begin": return flow.phase === "closed" ? { ...state, flow: state.pausedFlow ?? { phase: "editing" }, pausedFlow: null } : state;
    case "use_own": return { ...initialContributionState(state), flow: { phase: "editing" } };
    case "revise_input": return ["error", "challenge", "review"].includes(flow.phase) ? { ...state, answer: "", board: null, pausedFlow: null, flow: { phase: "editing" } } : state;
    case "close": return flow.phase === "closed" ? state : { ...state, pausedFlow: flow.phase === "preparing" ? { phase: "editing" } : flow.phase === "completing" ? { phase: "challenge", prepared: flow.prepared } : flow, flow: { phase: "closed" } };
    case "withdraw": return initialContributionState(state);
    case "show_card": return state.board ? { ...state, flow: { phase: "published" } } : state;
    case "edit_input": {
      if (flow.phase !== "editing") return state;
      if (event.key === "kind" && !["experience", "condition", "question", "counterexample"].includes(event.value)) return state;
      return { ...state, input: { ...state.input, [event.key]: event.value } };
    }
    case "example": return flow.phase === "editing" ? { ...state, input: { ...event.input, origin: "example" }, answer: "" } : state;
    case "edit_answer": return flow.phase === "challenge" || (flow.phase === "error" && flow.stage === "complete") ? { ...state, answer: event.value } : state;
    case "prepare":
      return (flow.phase === "editing" || (flow.phase === "error" && flow.stage === "prepare")) && experienceInputSchema.safeParse(state.input).success ? { ...state, flow: { phase: "preparing", requestId: event.requestId } } : state;
    case "prepared":
      return flow.phase === "preparing" && flow.requestId === event.requestId && event.result.questionId === state.questionId && event.result.classroomRevision === state.classroomRevision ? { ...state, flow: { phase: "challenge", prepared: event.result } } : state;
    case "complete": {
      const prepared = flow.phase === "challenge" || (flow.phase === "error" && flow.stage === "complete") ? flow.prepared : null;
      return prepared && state.answer.trim().length >= 10 ? { ...state, flow: { phase: "completing", requestId: event.requestId, prepared } } : state;
    }
    case "completed": {
      if (flow.phase !== "completing" || flow.requestId !== event.requestId || event.result.questionId !== state.questionId || event.result.classroomRevision !== state.classroomRevision) return state;
      const wording = { summary: event.result.mySeat.viewpoint.slice(0, 160), boundary: event.result.mySeat.addedCondition };
      return { ...state, flow: { phase: "review", wording, draftWording: wording, preparation: "ai", challenge: flow.prepared.seatmate.challenge, evidenceIds: event.result.evidenceIds } };
    }
    case "failed":
      return (flow.phase === "preparing" || flow.phase === "completing") && flow.requestId === event.requestId ? { ...state, flow: { phase: "error", stage: flow.phase === "preparing" ? "prepare" : "complete", message: event.message, prepared: flow.phase === "completing" ? flow.prepared : null } } : state;
    case "manual": {
      if (!["editing", "challenge", "error"].includes(flow.phase) || !experienceInputSchema.safeParse(state.input).success) return state;
      const prepared = "prepared" in flow ? flow.prepared : null;
      return { ...state, flow: { phase: "review", wording: { summary: state.input.outcome.slice(0, 160), boundary: state.input.origin === "example" ? "这是一段虚构示例，仅演示讨论过程，不能作为真实效果证据。" : "这只是一次自述经历，其他目标和环境下是否适用仍需要验证。" }, draftWording: null, preparation: "manual", challenge: prepared?.seatmate.challenge ?? "", evidenceIds: prepared?.evidenceIds ?? [] } };
    }
    case "edit_wording": return flow.phase === "review" ? { ...state, flow: { ...flow, wording: { ...flow.wording, [event.key]: event.value } } } : state;
    case "confirm": {
      if (flow.phase !== "review" || !contributionWordingSchema.safeParse(flow.wording).success) return state;
      const parsed = contributionCardSchema.safeParse({ id: event.id, questionId: state.questionId, classroomRevision: state.classroomRevision, input: state.input, answer: state.answer, challenge: flow.challenge, wording: flow.wording, draftWording: flow.draftWording, preparation: flow.preparation, evidenceIds: flow.evidenceIds, confirmedAt: event.at });
      return parsed.success ? { ...state, board: parsed.data, flow: { phase: "published" } } : state;
    }
    case "edit_card": {
      const card = state.board;
      if (!card) return state;
      return { ...state, flow: { phase: "review", wording: card.wording, draftWording: card.draftWording, preparation: card.preparation, challenge: card.challenge, evidenceIds: card.evidenceIds } };
    }
    default: return state;
  }
}
