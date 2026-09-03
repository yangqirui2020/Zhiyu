import { learnProgrammingDemoV3Scenario } from "../../../data/fixtures/scenarios/learn-programming-demo-v3.ts";

export async function loadDemoNarrative(questionId: string) {
  if (questionId !== "q_learn_programming") return null;
  return structuredClone(learnProgrammingDemoV3Scenario);
}
