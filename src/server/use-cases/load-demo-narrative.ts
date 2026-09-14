import { learnProgrammingDemoV3Scenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v3.ts";
import { loadSnapshotBundle } from "../providers/snapshot/snapshot-bundle";

export async function loadDemoNarrative(questionId: string) {
  if (questionId !== "q_learn_programming") return null;
  if (process.env.NODE_ENV !== "production" && process.env.DATA_MODE === "mock") return structuredClone(learnProgrammingDemoV3Scenario);
  return (await loadSnapshotBundle(questionId)).narrative;
}
