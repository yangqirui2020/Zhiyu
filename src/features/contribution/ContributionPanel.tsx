"use client";
import type { Classroom } from "@/domain/schemas";
import { contributionIdentity, contributionKinds, contributionWordingSchema, experienceInputSchema, type ContributionCard } from "@/domain/schemas/contribution";
import { invitationFor } from "../../../data/contributions/invitations";
import { LearningEvidence } from "../classroom/LearningEvidence";
import type { useContribution } from "./use-contribution";
import { contributionMarkdown } from "./invitation";
import { InviteClassroom } from "./InviteClassroom";
import styles from "./contribution.module.css";
import classroomStyles from "../classroom/classroom.module.css";

type Controller = ReturnType<typeof useContribution>;
export function ContributionPanel({ classroom, controller, onClose }: { classroom: Classroom; controller: Controller; onClose: () => void }) {
  const { state, dispatch, run, cancel } = controller;
  const flow = state.flow;
  const invitation = invitationFor(classroom.question.id);
  const inputValid = experienceInputSchema.safeParse(state.input).success;
  const backToEditing = () => { cancel(); dispatch({ type: "revise_input" }); };
  const manual = () => { cancel(); dispatch({ type: "manual" }); };
  const downloadCard = (card: ContributionCard) => {
    const blob = new Blob([contributionMarkdown(card, classroom.question.title)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `知遇一席-${classroom.question.id}-贡献卡.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
  return <aside className={`${classroomStyles.contextRail} ${styles.panel}`} aria-labelledby="contribution-title">
    <header className={classroomStyles.railHeader}><p className={styles.eyebrow}>经验入席 · 让一次尝试被听见</p><h2 id="contribution-title" tabIndex={-1}>{flow.phase === "published" ? "这间教室，多了你带来的一份材料" : flow.phase === "review" ? "这张贡献卡，由你说了算" : flow.phase === "challenge" || flow.phase === "completing" ? "同桌想听清这一个细节" : "讲一次经历，留下一席"}</h2></header>
    <div className={classroomStyles.railBody} data-lesson-content>
      {flow.phase === "editing" ? <>
        <p className={styles.invitation}>{invitation.invitation}</p><p className={styles.disclosure}>尝试失败、补充条件或留下疑问，都可以参与。无需证明观点新颖；确认前不会改变黑板。</p>
        <label className={styles.field}><span>这次想补充什么</span><select value={state.input.kind} onChange={event => dispatch({ type: "edit_input", key: "kind", value: event.target.value })}>{Object.entries(contributionKinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {([['event', '发生了什么', '当时你想做什么？卡在哪一步？至少 12 字。'], ['action', '你采取了什么办法', '具体尝试了什么？至少 10 字。'], ['outcome', '结果与仍不确定的地方', '结果如何？尚未验证也可以如实写出。至少 5 字。']] as const).map(([key, label, placeholder]) => <label key={key} className={styles.field}><span>{label}</span><textarea rows={3} maxLength={800} value={state.input[key]} placeholder={placeholder} onChange={event => dispatch({ type: "edit_input", key, value: event.target.value })} /></label>)}
        <p className={styles.identity}>{contributionIdentity(state.input)}</p>
        {state.input.origin === "example" ? <p className={styles.disclosure}>这是用于体验的虚构经历，修改后仍保留示例标记。要填写亲历，请先选择“改用自己的经历”。</p> : null}
        <div className={styles.actions}><button type="button" onClick={() => dispatch({ type: "example", input: invitation.example })}>填入虚构示例</button>{state.input.origin === "example" ? <button type="button" onClick={() => dispatch({ type: "use_own" })}>改用自己的经历</button> : null}</div>
        <p className={styles.disclosure}>选择同桌追问会将这些文字发送给 DeepSeek。仅处理本次课堂，不保存到公共数据库；请勿填写敏感信息。</p>
      </> : null}
      {flow.phase === "preparing" || flow.phase === "completing" ? <div role="status" className={styles.notice}><strong>{flow.phase === "preparing" ? "同桌正在结合你的经历，准备一个追问…" : "正在结合你的回应整理草稿…"}</strong><p>原始经历已保留。本次不会生成完整回答，也不会替你公开发布。</p><button type="button" onClick={onClose}>取消并返回课堂</button></div> : null}
      {flow.phase === "challenge" || (flow.phase === "error" && flow.stage === "complete") ? <>
        <p className={styles.identity}>{contributionIdentity(state.input)} · 本次追问由 AI 生成</p>
        <blockquote className={styles.challenge}>{flow.prepared?.seatmate.challenge}</blockquote>
        <p>{flow.prepared?.seatmate.rationale}</p>
        <details className={styles.original}><summary>回看我的原始经历</summary><OriginalCard cardInput={state.input} /></details>
        {flow.prepared ? <LearningEvidence classroom={classroom} evidenceIds={flow.prepared.evidenceIds} /> : null}
        <label className={styles.field}><span>我对这次追问的回应</span><textarea rows={5} maxLength={4000} value={state.answer} placeholder="只补充你确实知道的细节；不能确定的地方也请写明。至少 10 字。" onChange={event => dispatch({ type: "edit_answer", value: event.target.value })} /></label>
      </> : null}
      {flow.phase === "error" ? <div role="alert" className={styles.notice}><strong>没有完成，经历仍然保留。</strong><p>{flow.message}</p><button type="button" onClick={() => void run(flow.stage)}>重试{flow.stage === "prepare" ? "这次追问" : "整理回应"}</button></div> : null}
      {flow.phase === "error" && flow.stage === "prepare" ? <details className={styles.original}><summary>查看保留的原始经历</summary><OriginalCard cardInput={state.input} /></details> : null}
      {flow.phase === "review" ? <>
        <p className={styles.identity}>{contributionIdentity(state.input)} · {flow.preparation === "ai" ? "AI 整理草稿，等待本人确认" : "本人整理，未调用 AI 生成这张卡"}</p>
        <OriginalCard cardInput={state.input} />
        {state.answer ? <section className={styles.original}><h3>我对追问的实际回应</h3><p>{state.answer}</p></section> : null}
        <label className={styles.field}><span>我希望课堂多考虑的一点</span><textarea rows={3} maxLength={160} value={flow.wording.summary} onChange={event => dispatch({ type: "edit_wording", key: "summary", value: event.target.value })} /></label>
        <label className={styles.field}><span>这段材料适用于什么，不能证明什么</span><textarea rows={4} maxLength={300} value={flow.wording.boundary} onChange={event => dispatch({ type: "edit_wording", key: "boundary", value: event.target.value })} /></label>
        {flow.draftWording ? <details className={styles.original}><summary>对照 AI 最初草稿</summary><p>{flow.draftWording.summary}</p><p>{flow.draftWording.boundary}</p></details> : null}
        {flow.evidenceIds.length ? <LearningEvidence classroom={classroom} evidenceIds={flow.evidenceIds} /> : null}
        <p className={styles.disclosure}>确认表示以上表述符合你的意思，并不等于事实已核验。仅在本次课堂展示，原来的知乎材料与分组保持原样。</p>
      </> : null}
      {flow.phase === "published" && state.board ? <>
        <p className={styles.identity}>{contributionIdentity(state.board.input)} · {contributionKinds[state.board.input.kind]}</p>
        <div className={styles.published}><span>黑板新增 · 本人确认</span><h3>{state.board.wording.summary}</h3><p>{state.board.wording.boundary}</p></div>
        <p className={styles.disclosure}>你没有让所有人同意，而是给本次讨论多留了一份可继续追问的材料。仅在本次课堂展示，刷新、切题或撤回后清除。</p>
        <details className={styles.original}><summary>核对贡献卡的原始材料</summary><OriginalCard cardInput={state.board.input} />{state.board.challenge ? <><h3>系统追问</h3><p>{state.board.challenge}</p><h3>我的回应</h3><p>{state.board.answer}</p></> : null}</details>
        <div className={styles.actions}><button type="button" className={styles.primary} onClick={() => downloadCard(state.board!)}>下载我的贡献卡</button><button type="button" onClick={() => dispatch({ type: "edit_card" })}>修改这张贡献卡</button></div>
        <InviteClassroom questionId={classroom.question.id} title={classroom.question.title} synthetic={classroom.provenance.mode === "mock"} />
        <a className={styles.external} href={classroom.question.url} target="_blank" rel="noreferrer">{classroom.question.externalId ? "带着经历，回知乎亲自表达" : "去知乎搜索这道问题"} ↗</a>
        <button type="button" className={styles.withdraw} onClick={() => { cancel(); dispatch({ type: "withdraw" }); }}>撤回这次贡献</button>
      </> : null}
    </div>
    <footer className={classroomStyles.railFooter}>
      {flow.phase === "editing" ? <><button type="button" className={classroomStyles.primaryAction} disabled={!inputValid} onClick={() => void run("prepare")}>让同桌追问一个细节 →</button><button type="button" className={styles.manual} disabled={!inputValid} onClick={manual}>先由我自己整理</button></> : null}
      {flow.phase === "challenge" ? <button type="button" className={classroomStyles.primaryAction} disabled={state.answer.trim().length < 10} onClick={() => void run("complete")}>根据这次回应整理贡献卡 →</button> : null}
      {flow.phase === "error" ? <><button type="button" className={styles.manual} onClick={manual}>保留经历，由我自己整理</button><button type="button" className={styles.manual} onClick={backToEditing}>返回修改经历</button></> : null}
      {flow.phase === "review" ? <button type="button" className={classroomStyles.primaryAction} disabled={!contributionWordingSchema.safeParse(flow.wording).success} onClick={() => dispatch({ type: "confirm", id: `contribution_${crypto.randomUUID().replaceAll("-", "")}`, at: new Date().toISOString() })}>确认表述，把这份材料留在黑板上 →</button> : null}
      {flow.phase === "challenge" || flow.phase === "review" ? <button type="button" className={styles.manual} onClick={backToEditing}>修改经历并重新整理</button> : null}
      <button type="button" className={styles.manual} onClick={onClose}>返回课堂</button>
    </footer>
  </aside>;
}

function OriginalCard({ cardInput }: { cardInput: ContributionCard["input"] }) {
  return <div className={styles.original}>{([["event", "发生了什么"], ["action", "采取了什么办法"], ["outcome", "结果与仍不确定的地方"]] as const).map(([key, label]) => <section key={key}><h3>{label} · 原始输入</h3><p>{cardInput[key]}</p></section>)}</div>;
}
