/**
 * Demo V3 Classroom Session 状态机。
 *
 * 单一判别联合 SessionPhase 驱动 Golden Path：
 * exploring → roundtable → reflection → candidate → seatmate →
 * challenge → responded → mySeat → seated
 *
 * 禁止 boolean 堆叠：相位非法的动作在 reducer 中直接忽略。
 * 学生详情 / 走廊门牌是与相位正交的 panel，不污染主线。
 */

export type SessionPhase =
  | "exploring"
  | "roundtable"
  | "reflection"
  | "candidate"
  | "seatmate"
  | "challenge"
  | "responded"
  | "mySeat"
  | "seated";

export type SessionPanel =
  | { kind: "default" }
  | { kind: "student"; studentId: string }
  | { kind: "note" }
  | { kind: "campus"; roomNumber: string };

export type SessionState = {
  phase: SessionPhase;
  /** 圆桌当前发言序号；等于发言人总数表示圆桌结束 */
  roundtableStep: number;
  opinionText: string;
  answerText: string;
  panel: SessionPanel;
};

export type SessionEvent =
  | { type: "start_roundtable" }
  | { type: "roundtable_advance" }
  | { type: "roundtable_finish" }
  | { type: "edit_opinion"; value: string }
  | { type: "use_sample_opinion"; value: string }
  | { type: "submit_opinion" }
  | { type: "open_seatmate" }
  | { type: "start_challenge" }
  | { type: "edit_answer"; value: string }
  | { type: "use_sample_answer"; value: string }
  | { type: "submit_answer" }
  | { type: "open_my_seat" }
  | { type: "claim_seat" }
  | { type: "open_note" }
  | { type: "select_student"; studentId: string }
  | { type: "open_campus_room"; roomNumber: string; isCurrent: boolean }
  | { type: "close_panel" }
  | { type: "reset" };

export const initialSessionState: SessionState = {
  phase: "exploring",
  roundtableStep: 0,
  opinionText: "",
  answerText: "",
  panel: { kind: "default" },
};

/** 各相位之间的先后约束：未到达的相位不可跳入 */
const phaseOrder: SessionPhase[] = [
  "exploring",
  "roundtable",
  "reflection",
  "candidate",
  "seatmate",
  "challenge",
  "responded",
  "mySeat",
  "seated",
];

function phaseAtLeast(phase: SessionPhase, target: SessionPhase): boolean {
  return phaseOrder.indexOf(phase) >= phaseOrder.indexOf(target);
}

export function sessionReducer(
  state: SessionState,
  event: SessionEvent,
): SessionState {
  switch (event.type) {
    case "start_roundtable":
      if (state.phase !== "exploring") return state;
      return { ...state, phase: "roundtable", roundtableStep: 0, panel: { kind: "default" } };

    case "roundtable_advance":
      if (state.phase !== "roundtable") return state;
      return { ...state, roundtableStep: state.roundtableStep + 1 };

    case "roundtable_finish":
      if (state.phase !== "roundtable") return state;
      return { ...state, phase: "reflection", panel: { kind: "default" } };

    case "edit_opinion":
      if (state.phase !== "reflection") return state;
      return { ...state, opinionText: event.value };

    case "use_sample_opinion":
      if (state.phase !== "reflection") return state;
      return { ...state, opinionText: event.value };

    case "submit_opinion":
      if (state.phase !== "reflection" || !state.opinionText.trim()) return state;
      return { ...state, phase: "candidate", panel: { kind: "default" } };

    case "open_seatmate":
      if (state.phase !== "candidate") return state;
      return { ...state, phase: "seatmate", panel: { kind: "default" } };

    case "start_challenge":
      if (state.phase !== "seatmate") return state;
      return { ...state, phase: "challenge", panel: { kind: "default" } };

    case "edit_answer":
      if (state.phase !== "challenge") return state;
      return { ...state, answerText: event.value };

    case "use_sample_answer":
      if (state.phase !== "challenge") return state;
      return { ...state, answerText: event.value };

    case "submit_answer":
      if (state.phase !== "challenge" || !state.answerText.trim()) return state;
      return { ...state, phase: "responded", panel: { kind: "default" } };

    case "open_my_seat":
      if (state.phase !== "responded") return state;
      return { ...state, phase: "mySeat", panel: { kind: "default" } };

    case "claim_seat":
      if (state.phase !== "mySeat") return state;
      return { ...state, phase: "seated", panel: { kind: "default" } };

    case "open_note":
      // 完整课堂笔记只在认知变化发生后可回看
      if (!phaseAtLeast(state.phase, "responded")) return state;
      return { ...state, panel: { kind: "note" } };

    case "select_student":
      return { ...state, panel: { kind: "student", studentId: event.studentId } };

    case "open_campus_room":
      if (event.isCurrent) return { ...state, panel: { kind: "default" } };
      return { ...state, panel: { kind: "campus", roomNumber: event.roomNumber } };

    case "close_panel":
      return { ...state, panel: { kind: "default" } };

    case "reset":
      return { ...initialSessionState };

    default:
      return state;
  }
}

export type NoteSectionState = "locked" | "ready";

/** 课堂笔记四段随相位渐进生长：①candidate ②candidate ③challenge ④responded */
export function noteSectionStatus(phase: SessionPhase): {
  before: NoteSectionState;
  heard: NoteSectionState;
  changed: NoteSectionState;
  after: NoteSectionState;
} {
  return {
    before: phaseAtLeast(phase, "candidate") ? "ready" : "locked",
    heard: phaseAtLeast(phase, "candidate") ? "ready" : "locked",
    changed: phaseAtLeast(phase, "challenge") ? "ready" : "locked",
    after: phaseAtLeast(phase, "responded") ? "ready" : "locked",
  };
}

/** 笔记进度条自 candidate 相位起可见 */
export function noteProgressVisible(phase: SessionPhase): boolean {
  return phaseAtLeast(phase, "candidate");
}

export function seatClaimed(phase: SessionPhase): boolean {
  return phase === "seated";
}

export function candidateVisible(phase: SessionPhase): boolean {
  return phaseAtLeast(phase, "candidate");
}
