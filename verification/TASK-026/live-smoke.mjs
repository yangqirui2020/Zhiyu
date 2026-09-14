import { writeFile } from "node:fs/promises";
const origin = "http://localhost:3006";
const results = [];
async function request(name, path, body) {
  const start = Date.now();
  const response = await fetch(origin + path, { ...(body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(35000) });
  const data = await response.json();
  results.push({ name, status: response.status, mode: data.meta?.mode, resultStatus: data.data?.status, stage: data.data?.stage, code: data.error?.code, durationMs: Date.now() - start });
  if (!response.ok) throw new Error(`${name}: ${data.error?.code ?? response.status}`);
  return data;
}
try {
  const classroom = (await request("synthetic_classroom", "/api/v1/classrooms/q_projects_and_foundations")).data;
  const noteText = "我会给每个卡点加一条休息后复测的记录：先保存最小失败例子，离开屏幕休息十分钟，再在不看刚才答案的情况下重试。只有休息后仍在同一概念上卡住，才把它列入补基础清单；如果只是输入看错或连续操作失误，就先调整学习时长，而不是增加课程。";
  const answerText = "休息不应成为重复拖延的理由。我会只允许一次复测，记录具体错误和时间，复测时使用等价而非完全相同的输入。如果无法解释程序为什么失败，就查证相关概念并做一个小练习；这只是安排练习的方法，不能证明已经学会。";
  const base = { schemaVersion: "1.0.0-rc.2", questionId: classroom.question.id, classroomRevision: classroom.revision, noteText };
  const candidate = await request("live_candidate", "/api/v1/candidate-seat", { ...base, idempotencyKey: `task026_candidate_${Date.now()}` });
  if (candidate.meta.mode !== "live") throw new Error("Non-sample note did not use Live");
  const prepared = await request("live_prepare", "/api/v1/learning-turn", { ...base, stage: "prepare", idempotencyKey: `task026_prepare_${Date.now()}` });
  const complete = await request("live_complete", "/api/v1/learning-turn", { ...base, stage: "complete", answerText, challengeToken: prepared.data.challengeToken, idempotencyKey: `task026_complete_${Date.now()}` });
  if (complete.data.classNote.before !== noteText || complete.data.classNote.changed !== answerText) throw new Error("Original expressions were not preserved");
  if (!complete.data.evidenceIds.every(id => classroom.evidence.some(e => e.id === id))) throw new Error("Cross-classroom evidence");
  await writeFile("verification/TASK-026/live-smoke.json", JSON.stringify({ testedAt: new Date().toISOString(), syntheticQaInput: true, classroomMode: "mock", sourceCount: classroom.sources.length, results, inputPreserved: true, evidenceInCurrentClassroom: true, candidateDecision: candidate.data.assessments[0].decision }, null, 2));
  console.log(JSON.stringify(results));
} catch (error) {
  await writeFile("verification/TASK-026/live-smoke.json", JSON.stringify({ results, failure: error.message }, null, 2));
  console.error(error.message); process.exitCode = 1;
}
