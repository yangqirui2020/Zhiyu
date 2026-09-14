import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contributionReducer as reduce, initialContributionState, type ContributionState } from "../../src/features/contribution/contribution-machine.ts";
import { contributionIdentity, experienceInputSchema, experienceNote } from "../../src/domain/schemas/contribution.ts";
import { contributionMarkdown, invitationText, publicClassroomUrl } from "../../src/features/contribution/invitation.ts";
import { invitationFor } from "../../data/contributions/invitations.ts";
import { readSnapshotBundle } from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import { learningSampleSchema } from "../../src/domain/schemas/learning-sample.ts";
const { classroom, assets } = await readSnapshotBundle();
const sample = learningSampleSchema.parse(assets["learning/sample.json"]);
const identity = { questionId: classroom.question.id, classroomRevision: classroom.revision };
const prepared = { ...identity, schemaVersion: "1.0.0-rc.2" as const, stage: "prepared" as const, ...sample.question, challengeToken: "private-signed-challenge-token" };
const completed = { ...identity, schemaVersion: "1.0.0-rc.2" as const, stage: "completed" as const, id: "learning_test", ...sample.completion };
const original = { kind: "experience" as const, origin: "self_report" as const, event: "  我在课程练习里尝试读取一张表格，但程序一直无法找到文件。\n", action: "我先检查路径并运行老师提供的最小例子，再修改自己的代码。", outcome: "最终读到了文件，但我还没有换一台电脑确认能否运行。" };
const editing = () => {
  let s = reduce(initialContributionState(identity), { type: "begin" });
  for (const key of ["event", "action", "outcome"] as const) s = reduce(s, { type: "edit_input", key, value: original[key] });
  return s;
};
const confirm = (s: ContributionState) => reduce(s, { type: "confirm", id: "contribution_test", at: "2026-09-14T21:00:00.000Z" });
const reviewing = () => {
  let s = reduce(editing(), { type: "prepare", requestId: "prepare_current" });
  s = reduce(s, { type: "prepared", requestId: "prepare_current", result: prepared });
  s = reduce(s, { type: "edit_answer", value: "我只在自己的电脑试过，暂时不知道其他环境的结果。" });
  s = reduce(s, { type: "complete", requestId: "complete_current" });
  return reduce(s, { type: "completed", requestId: "complete_current", result: completed });
};

describe("experience contributions", () => {
  it("preserves original text and rejects whitespace-only fields", () => {
    assert.deepEqual(experienceInputSchema.parse(original), original);
    assert.match(experienceNote(original), /用户自述 · 未独立核验/);
    assert.ok(experienceNote(original).includes(original.event));
    assert.equal(experienceInputSchema.safeParse({ ...original, action: " ".repeat(20) }).success, false);
  });
  it("offers three distinct explicitly fictional examples, retaining origin after edits", () => {
    const examples = ["q_learn_programming", "q_projects_and_foundations", "q_learning_with_ai"].map(id => invitationFor(id).example);
    assert.equal(new Set(examples.map(x => x.event)).size, 3);
    for (const input of examples) {
      let s = reduce(editing(), { type: "example", input });
      s = reduce(s, { type: "edit_input", key: "event", value: original.event });
      assert.equal(contributionIdentity(s.input), "示例经历 · 虚构");
      s = reduce(s, { type: "use_own" });
      assert.equal(s.input.origin, "self_report"); assert.equal(s.input.event, "");
    }
  });
  it("permits participation without Candidate or novelty checks, but requires confirmation", () => {
    let s = reviewing(); assert.equal(s.flow.phase, "review"); assert.equal(s.board, null);
    s = reduce(s, { type: "edit_wording", key: "summary", value: "我希望先区分环境错误和语言错误，再决定是否换语言。" });
    s = confirm(s); assert.ok(s.board); assert.deepEqual(s.board.input, original);
    assert.equal(s.board.draftWording?.summary, completed.mySeat.viewpoint.slice(0, 160));
    assert.notEqual(s.board.wording.summary, s.board.draftWording?.summary);
    assert.equal(s.board.answer, "我只在自己的电脑试过，暂时不知道其他环境的结果。");
  });
  it("retains the actual question and response when editing a published card", () => {
    let s = confirm(reviewing()); const first = s.board!;
    s = reduce(s, { type: "edit_card" });
    s = reduce(s, { type: "edit_wording", key: "boundary", value: "这只是我个人的一次尝试，还需要换个环境再次验证。" });
    assert.deepEqual(s.board, first);
    s = confirm(s);
    assert.equal(s.board?.challenge, first.challenge); assert.equal(s.board?.answer, first.answer);
    assert.deepEqual(s.board?.draftWording, first.draftWording);
  });
  it("cannot publish incomplete or empty wording", () => {
    assert.equal(confirm(editing()).board, null);
    const s = reduce(reviewing(), { type: "edit_wording", key: "summary", value: " " });
    assert.equal(confirm(s).board, null);
    assert.equal(reduce(initialContributionState(identity), { type: "manual" }).flow.phase, "closed");
  });
  it("labels manual preparation accurately and does not invent source evidence", () => {
    const s = confirm(reduce(editing(), { type: "manual" }));
    assert.equal(s.board?.preparation, "manual"); assert.equal(s.board?.draftWording, null);
    assert.deepEqual(s.board?.evidenceIds, []); assert.equal(s.board?.challenge, "");
    const example = reduce(editing(), { type: "example", input: invitationFor(identity.questionId).example });
    assert.match(confirm(reduce(example, { type: "manual" })).board!.wording.boundary, /虚构示例/);
  });
  it("rejects late, wrong-room and wrong-revision results", () => {
    const s = reduce(editing(), { type: "prepare", requestId: "current" });
    for (const event of [
      { type: "prepared" as const, requestId: "old", result: prepared },
      { type: "prepared" as const, requestId: "current", result: { ...prepared, questionId: "q_other" } },
      { type: "prepared" as const, requestId: "current", result: { ...prepared, classroomRevision: "old" } },
    ]) assert.deepEqual(reduce(s, event), s);
    const closed = reduce(s, { type: "close" });
    assert.deepEqual(reduce(closed, { type: "prepared", requestId: "current", result: prepared }), closed);
    const withdrawn = reduce(s, { type: "withdraw" });
    assert.deepEqual(reduce(withdrawn, { type: "prepared", requestId: "current", result: prepared }), withdrawn);
  });
  it("keeps input for retry, cancels safely, and resumes an interrupted response", () => {
    let s = reduce(editing(), { type: "prepare", requestId: "old" });
    s = reduce(s, { type: "failed", requestId: "old", message: "timeout" });
    assert.deepEqual(s.input, original);
    s = reduce(s, { type: "prepare", requestId: "new" });
    assert.equal(reduce(s, { type: "failed", requestId: "old", message: "late" }).flow.phase, "preparing");
    s = reduce(s, { type: "prepared", requestId: "new", result: prepared });
    s = reduce(s, { type: "edit_answer", value: "这是我保留的实际回应，失败后应该还能继续修改。" });
    s = reduce(s, { type: "complete", requestId: "complete" });
    s = reduce(s, { type: "close" });
    s = reduce(s, { type: "begin" });
    assert.equal(s.flow.phase, "challenge"); assert.ok(s.answer.includes("保留的实际回应"));
    assert.deepEqual(s.input, original);
  });
  it("clears board and all private material on withdrawal, permitting a second operation", () => {
    const withdrawn = reduce(confirm(reviewing()), { type: "withdraw" });
    assert.deepEqual(withdrawn, initialContributionState(identity));
    assert.equal(reduce(withdrawn, { type: "begin" }).flow.phase, "editing");
  });
  it("preserves the original fields but invalidates old response and wording when revising input", () => {
    const s = reduce(reviewing(), { type: "revise_input" });
    assert.equal(s.flow.phase, "editing"); assert.deepEqual(s.input, original);
    assert.equal(s.answer, ""); assert.equal(s.board, null);
    assert.deepEqual(reduce(s, { type: "completed", requestId: "complete_current", result: completed }), s);
  });
  it("exports actual expressions but keeps the signed challenge out of cards and invitations", () => {
    const card = confirm(reviewing()).board!;
    const markdown = contributionMarkdown(card, classroom.question.title);
    for (const text of [original.event, original.action, original.outcome, card.answer, card.challenge]) assert.ok(markdown.includes(text));
    assert.ok(!markdown.includes(prepared.challengeToken));
    const text = invitationText(identity.questionId, classroom.question.title, invitationFor(identity.questionId).invitation);
    assert.ok(text.includes(publicClassroomUrl(identity.questionId)));
    for (const privateText of [original.event, original.action, card.answer, prepared.challengeToken]) assert.ok(!text.includes(privateText));
    assert.equal(new URL(publicClassroomUrl(identity.questionId)).search, "");
  });
});
