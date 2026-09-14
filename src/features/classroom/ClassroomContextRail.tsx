"use client";

import { useState } from "react";

import type { AnalysisResult, Classroom } from "@/domain/schemas";
import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import { getStudentDetails, studentSeatNumber } from "./classroom-selectors";
import {
  PixelStudentPortrait,
  PIXEL_CLUSTER_COLORS,
} from "./PixelStudentPortrait";
import {
  noteProgressVisible,
  noteSectionStatus,
  type SessionState,
} from "./session-machine";
import styles from "./classroom.module.css";
import { LearningEvidence } from "./LearningEvidence";

type ClassroomContextRailProps = {
  classroom: Classroom;
  scenario: DemoScenarioV3;
  state: SessionState;
  onStartRoundtable: () => void;
  onEditOpinion: (value: string) => void;
  onUseSampleOpinion: () => void;
  onSubmitOpinion: () => void;
  onRetryOpinion: () => void;
  onOpenSeatmate: () => void;
  onStartChallenge: () => void;
  onEditAnswer: (value: string) => void;
  onUseSampleAnswer: () => void;
  onSubmitAnswer: () => void;
  onSelectCluster: (clusterId: string) => void;
  onOpenNote: () => void;
  onClaimSeat: () => void;
  onOpenCampusRoom: (roomNumber: string, isCurrent: boolean) => void;
  onReset: () => void;
};

export function ClassroomContextRail({
  classroom,
  scenario,
  state,
  onStartRoundtable,
  onEditOpinion,
  onUseSampleOpinion,
  onSubmitOpinion,
  onRetryOpinion,
  onOpenSeatmate,
  onStartChallenge,
  onEditAnswer,
  onUseSampleAnswer,
  onSubmitAnswer,
  onSelectCluster,
  onOpenNote,
  onClaimSeat,
  onOpenCampusRoom,
  onReset,
}: ClassroomContextRailProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const real = classroom.provenance.mode !== "mock";
  const learningPending = state.learning.status === "preparing" || state.learning.status === "completing";
  const prepared = "prepared" in state.learning ? state.learning.prepared : null;
  const seatmate = !real || prepared ? getStudentDetails(classroom, scenario.seatmate.studentId) : null;
  const learningMeta = state.learning.status === "completed" ? state.learning.meta : "prepareMeta" in state.learning ? state.learning.prepareMeta : null;
  const learningMode = learningMeta ? <p className={styles.sampleResultDisclosure}>{learningMeta.mode === "live" ? "本阶段：实时 AI 整理，请核对" : "本阶段：精确示例结果"} · 追问由系统生成，不代表真实答主发言。</p> : null;
  const learningError = state.learning.status === "error" ? <div className={styles.analysisError} role="alert"><strong>这一步没有完成，输入已保留。</strong><p>{state.learning.message}</p><p>可以重试；会话失效时请重新开始。</p></div> : null;
  const sampleMatches = state.opinionText.trim() === scenario.noteText.trim();
  const sampleAnswerMatches =
    state.answerText.trim() === scenario.seatmate.sampleAnswer.trim();
  const canSubmitOpinion = state.opinionText.trim().length >= 50;
  const analysisMeta = state.candidate.status === "resolved" || state.candidate.status === "no_candidate" ? state.candidate.meta : undefined;
  const analysisMode = analysisMeta ? <p className={styles.sampleResultDisclosure}>{analysisMeta.mode === "live" ? "本次观点分析：实时 AI" : analysisMeta.mode === "sample" ? "本次观点分析：精确示例结果" : "本次观点分析：开发 Mock"}{analysisMeta.fallbackFrom ? ` · 实时分析未完成，已显示同一示例的结果：${analysisMeta.fallbackReason}` : ""}</p> : null;
  const seatmateClusterIndex = seatmate?.cluster
    ? classroom.clusters.findIndex((cluster) => cluster.id === seatmate.cluster?.id)
    : -1;
  const seatmateColor =
    PIXEL_CLUSTER_COLORS[
      Math.max(0, seatmateClusterIndex) % PIXEL_CLUSTER_COLORS.length
    ];

  const noteProgress = noteProgressVisible(state.phase) ? (
    <NoteProgressStrip state={state} onOpenNote={onOpenNote} />
  ) : null;

  // ── 走廊门牌（正交 panel）────────────────────────────────
  const panel = state.panel;
  if (panel.kind === "campus") {
    const roomNumber = panel.roomNumber;
    const targetRoom = scenario.campus.rooms.find((item) => item.number === roomNumber);
    const isNextRoom = roomNumber === scenario.nextClassroom.number;

    return (
      <aside className={styles.contextRail} aria-labelledby="campus-panel-title">
        <RailHeader
          id="campus-panel-title"
          eyebrow={`${scenario.campus.building} · ${scenario.campus.floor}`}
          title={`走廊上的 Classroom ${roomNumber}`}
        />
        <div className={styles.railBody}>
          <section className={styles.roomPreviewCard}>
            <span className={styles.roomPreviewNumber}>{roomNumber}</span>
            <div>
              <p>{targetRoom?.note ?? "走廊预告"}</p>
              <h3>{targetRoom?.title ?? "另一间认知教室"}</h3>
            </div>
          </section>
          {isNextRoom ? (
            <div className={styles.causalNote}>
              <strong>为什么推荐它</strong>
              <p>{scenario.nextClassroom.causalNote}</p>
              <p className={styles.causalQuestion}>
                本班尚未解决：{scenario.blackboard.openQuestion}
              </p>
            </div>
          ) : null}
          <p className={styles.railLead}>
            {isNextRoom
              ? scenario.nextClassroom.statusNote + "；门牌用于演示「一个答案会长出新问题」，不会伪装成已加载的课堂。"
              : "这一轮只完整开放 Classroom 101。其他门牌用于建立认知校园的入口感，不会伪装成已经加载的数据。"}
          </p>
          <div className={styles.floorDirectory} aria-label="楼层教室目录">
            {scenario.campus.rooms.map((item) => (
              <div
                key={item.number}
                className={item.status === "current" ? styles.floorRoomCurrent : styles.floorRoom}
              >
                <strong>{item.number}</strong>
                <span>{item.title}</span>
                <small>{item.note}</small>
              </div>
            ))}
          </div>
        </div>
        <footer className={styles.railFooter}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => onOpenCampusRoom("101", true)}
          >
            返回 Classroom 101
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </aside>
    );
  }

  // ── Phase: roundtable ────────────────────────────────────
  if (state.phase === "roundtable") {
    return (
      <aside className={styles.contextRail} aria-labelledby="roundtable-panel-title">
        <RailHeader
          id="roundtable-panel-title"
          eyebrow="Classroom 101 · 课代表圆桌"
          title={`${classroom.clusters.length} 个小组正在互相听对方说话`}
        />
        <div className={styles.railBody}>
          <p className={styles.railLead}>
            每个学习组派一名课代表，把本组最核心的一句话摆到讲台上。讨论结束后，黑板会写下全班的三项结论。
          </p>
          <ul className={styles.roundtableRoster}>
            {scenario.roundtable.speakers.map((speaker, index) => {
              const details = getStudentDetails(classroom, speaker.studentId);
              const clusterIndex = classroom.clusters.findIndex(
                (cluster) => cluster.id === speaker.clusterId,
              );
              const color =
                PIXEL_CLUSTER_COLORS[
                  Math.max(0, clusterIndex) % PIXEL_CLUSTER_COLORS.length
                ];
              const status =
                index < state.roundtableStep
                  ? styles.rosterSpoke
                  : index === state.roundtableStep
                    ? styles.rosterSpeaking
                    : styles.rosterWaiting;
              return (
                <li key={speaker.studentId} className={status}>
                  <i style={{ background: color }} aria-hidden="true" />
                  <span>{details?.cluster?.label ?? "观点组"}</span>
                  <small>
                    {index < state.roundtableStep
                      ? "已发言"
                      : index === state.roundtableStep
                        ? "正在发言"
                        : "等待"}
                  </small>
                </li>
              );
            })}
          </ul>
          <p className={styles.privacyNote}>
            <strong>演示边界</strong>
            <span>本轮讨论为预生成内容，课代表是 AI 归纳，不是真实答主。</span>
          </p>
        </div>
      </aside>
    );
  }

  // ── Phase: reflection ────────────────────────────────────
  if (state.phase === "reflection") {
    return (
      <aside className={styles.contextRail} aria-labelledby="reflection-title">
        <RailHeader
          id="reflection-title"
          eyebrow="黑板已经写下三件事"
          title="听完他们，你现在怎么看？"
        />
        <div className={styles.railBody}>
          <div className={styles.blackboardRecap}>
            <section>
              <span>{classroom.provenance.mode === "mock" ? "全班共识" : "样本共同点"}</span>
              <p>{scenario.blackboard.consensus}</p>
            </section>
            <section>
              <span>核心争议</span>
              <p>{scenario.blackboard.controversy}</p>
            </section>
            <section>
              <span>尚未解决的问题</span>
              <p>{scenario.blackboard.openQuestion}</p>
            </section>
          </div>
          <label className={styles.noteField}>
            <span>你的初始观点</span>
            <textarea
              maxLength={8000}
              value={state.opinionText}
              onChange={(event) => onEditOpinion(event.target.value)}
              disabled={state.candidate.status === "analyzing"}
              placeholder="听完各组的讨论，写下你现在的判断……"
            />
          </label>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={onUseSampleOpinion}
            disabled={state.candidate.status === "analyzing"}
          >
            使用示例观点
          </button>
          {!canSubmitOpinion && state.opinionText ? (
            <p className={styles.inlineNotice} role="status">
              再写一点（至少 50 字），系统才有足够内容检查你的观点。
            </p>
          ) : null}
          {!sampleMatches && canSubmitOpinion ? (
            <p className={styles.inlineNotice} role="status">
              观点需要有自己的判断和理由；材料不足时会保留输入并说明原因。
            </p>
          ) : null}
          {state.candidate.status === "analyzing" ? (
            <p className={styles.analysisStatus} role="status">
              正在分析你的观点与当前课堂的关系…
            </p>
          ) : null}
          {state.candidate.status === "error" ? (
            <div className={styles.analysisError} role="alert">
              <strong>这次分析没有完成，你的输入已经保留。</strong>
              <p>{state.candidate.message}</p>
              <button type="button" className={styles.textAction} onClick={onRetryOpinion}>
                重试刚才的观点
              </button>
            </div>
          ) : null}
          {state.candidate.status === "no_candidate" ? (
            <div className={styles.analysisEmpty} role="status">
              <strong>本次分析未满足亮座条件。</strong>
              {state.candidate.result.assessments.map((item) => <div key={item.claimId}>
                <p>与题目关系：{item.relevance.explanation}</p>
                <p>笔记依据：{item.noteSupport.explanation}</p>
                <p>当前样本覆盖：{item.coverage.explanation}</p>
              </div>)}
              <p>输入已保留。你可以补充理由、修改后重试，或使用示例继续体验。</p>
            </div>
          ) : null}
          <div className={styles.privacyNote}>
            <strong>演示边界</strong>
            <span>{classroom.provenance.mode === "mock" ? "开发模式使用本地 Mock；输入不持久化。" : "提交后将由 DeepSeek 分析一条主要主张；输入不保存到数据库。请勿填写个人敏感信息。"}</span>
          </div>
          {analysisMode}
        </div>
        <footer className={styles.railFooter}>
          <button
            type="button"
            className={styles.primaryAction}
            disabled={!canSubmitOpinion || state.candidate.status === "analyzing"}
            onClick={onSubmitOpinion}
          >
            {state.candidate.status === "analyzing" ? "正在寻找…" : "找到我的一席"}
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </aside>
    );
  }

  // ── Phase: candidate ─────────────────────────────────────
  if (state.phase === "candidate") {
    const result = state.candidate.status === "resolved" ? state.candidate.result : null;
    const candidateSeat = result?.candidateSeats[0];
    const claim = result?.claims.find((item) => item.id === candidateSeat?.claimId);
    const assessment = result?.assessments.find(
      (item) => item.claimId === candidateSeat?.claimId,
    );

    if (!result || !candidateSeat || !claim || !assessment) return null;

    return (
      <aside className={`${styles.contextRail} ${styles.candidateRail}`} aria-labelledby="candidate-title">
        <RailHeader
          id="candidate-title"
          eyebrow="Candidate Seat · 空位已亮起"
          title={candidateSeat.title}
        />
        <div className={styles.railBody}>
          {analysisMode}
          {learningError}
          {learningPending ? <p role="status">正在根据你的观点选择同桌并准备追问…</p> : null}
          <p className={styles.candidateClaim}>{claim.text}</p>
          <div className={styles.positionRationale}>
            <span>为什么你坐在这里</span>
            <p>{assessment.coverage.explanation}</p>
          </div>
          <div className={styles.evidenceChecklist}>
            <CandidateEvidenceItem
              index={1}
              label="相关性"
              explanation={assessment.relevance.explanation}
              evidenceIds={candidateSeat.evidencePanel.relevanceEvidenceIds}
              classroom={classroom}
              result={result}
            />
            <CandidateEvidenceItem
              index={2}
              label="笔记支持"
              explanation={assessment.noteSupport.explanation}
              evidenceIds={candidateSeat.evidencePanel.noteSupportEvidenceIds}
              classroom={classroom}
              result={result}
            />
            <CandidateEvidenceItem
              index={3}
              label="样本覆盖"
              explanation={assessment.coverage.explanation}
              evidenceIds={candidateSeat.evidencePanel.coverageEvidenceIds}
              classroom={classroom}
              result={result}
            />
          </div>
          <p className={styles.coverageDisclosure}>{candidateSeat.disclosure}</p>
          {result.warnings.map((warning) => (
            <p className={styles.sampleResultDisclosure} key={warning}>{warning}</p>
          ))}
          {seatmate ? (
            <button type="button" className={styles.seatmateTeaser} onClick={onOpenSeatmate}>
              <PixelStudentPortrait
                seed={seatmate.student.displaySeed}
                color={seatmateColor}
                role="seatmate"
              />
              <span>
                <strong>看来你有同桌了</strong>
                <small>学生 {studentSeatNumber(classroom, seatmate.student.id)} 就坐在亮起空位旁边</small>
              </span>
              <i aria-hidden="true">→</i>
            </button>
          ) : null}
          {noteProgress}
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.primaryAction} onClick={onOpenSeatmate} disabled={learningPending}>
            {learningPending ? "正在准备追问…" : state.learning.status === "error" ? "重试准备同桌" : "认识我的同桌"}
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.textAction} onClick={onReset}>重新开始</button>
        </footer>
      </aside>
    );
  }

  // ── Phase: seatmate ──────────────────────────────────────
  if (state.phase === "seatmate" && seatmate) {
    const seatNumber = studentSeatNumber(classroom, seatmate.student.id);
    return (
      <aside className={styles.contextRail} aria-labelledby="seatmate-title">
        <RailHeader
          id="seatmate-title"
          eyebrow="你的同桌 · 邻座关系已成立"
          title={`坐在你旁边的学生 ${seatNumber}`}
        />
        <div className={styles.railBody}>
          {learningMode}
          <section className={styles.seatmateIdentityCard}>
            <PixelStudentPortrait
              seed={seatmate.student.displaySeed}
              color={seatmateColor}
              role="seatmate"
              label={`同桌学生 ${seatNumber}`}
            />
            <div>
              <div className={styles.identityMeta}>
                <span>学生 {seatNumber}</span>
                <span>{seatmate.cluster?.label ?? "独立观点"}</span>
              </div>
              <h3>{seatmate.source.author.displayName}</h3>
              <p>{seatmate.argument.conclusion}</p>
            </div>
          </section>

          <section className={styles.seatmateReason}>
            <span>为什么他是你的同桌</span>
            <p>{scenario.seatmate.rationale}</p>
          </section>

          <div className={styles.relationshipGrid}>
            <section>
              <span aria-hidden="true">＝</span>
              <div><strong>共同点</strong><p>{scenario.seatmate.commonGround}</p></div>
            </section>
            <section>
              <span aria-hidden="true">≠</span>
              <div><strong>差异点</strong><p>{scenario.seatmate.difference}</p></div>
            </section>
          </div>

          <section className={styles.challengeTeaser}>
            <div className={styles.interactionHeading}>
              <span>一次有效认知摩擦</span>
              <small>{real ? "系统依据你的观点与来源生成一次追问" : "预设追问 · 针对你的观点漏洞 · 非实时 AI 回复"}</small>
            </div>
            <p>
              同桌的职责不是陪聊，而是帮你发现自己还没想完整的地方。
            </p>
          </section>
          {prepared ? <LearningEvidence classroom={classroom} evidenceIds={prepared.evidenceIds} /> : null}
          {noteProgress}
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.primaryAction} onClick={onStartChallenge}>
            让他追问我
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.textAction} onClick={onReset}>重新开始</button>
        </footer>
      </aside>
    );
  }

  // ── Phase: challenge ─────────────────────────────────────
  if (state.phase === "challenge" && seatmate) {
    const seatNumber = studentSeatNumber(classroom, seatmate.student.id);
    return (
      <aside className={styles.contextRail} aria-labelledby="challenge-title">
        <RailHeader
          id="challenge-title"
          eyebrow="同桌追问 · 一次认知摩擦"
          title="他指出了你还没想完整的地方"
        />
        <div className={styles.railBody}>
          {learningMode}
          {learningError}
          <section className={styles.challengeCard}>
            <div className={styles.challengeSpeaker}>
              <PixelStudentPortrait
                seed={seatmate.student.displaySeed}
                color={seatmateColor}
                role="seatmate"
              />
              <span>学生 {seatNumber} 追问你</span>
            </div>
            <p className={styles.challengeText}>{scenario.seatmate.challenge}</p>
          </section>

          <label className={styles.noteField}>
            <span>你的回应</span>
            <textarea
              maxLength={4000}
              disabled={learningPending}
              value={state.answerText}
              onChange={(event) => onEditAnswer(event.target.value)}
              placeholder="认真回答这个追问——它会写进你的课堂笔记……"
            />
          </label>
          <button type="button" className={styles.secondaryAction} onClick={onUseSampleAnswer} disabled={learningPending}>
            {real ? "填入参考回应（可修改）" : "使用演示答案"}
          </button>
          {!real && !sampleAnswerMatches && state.answerText ? (
            <p className={styles.inlineNotice} role="status">
              当前 Demo 只为示例回应准备了后续学习产物；恢复示例后可继续。这样不会把固定结果冒充成你的回答。
            </p>
          ) : null}
          {noteProgress}
        </div>
        <footer className={styles.railFooter}>
          <button
            type="button"
            className={styles.primaryAction}
            disabled={learningPending || (real ? state.answerText.trim().length < 10 : !sampleAnswerMatches)}
            onClick={onSubmitAnswer}
          >
            {learningPending ? "正在整理你的回应…" : state.learning.status === "error" ? "重试整理回应" : "写下我的回应"}
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.textAction} onClick={onReset}>重新开始</button>
        </footer>
      </aside>
    );
  }

  // ── Phase: mySeat ────────────────────────────────────────
  if (state.phase === "mySeat") {
    return (
      <aside className={`${styles.contextRail} ${styles.mySeatRail}`} aria-labelledby="myseat-title">
        <RailHeader
          id="myseat-title"
          eyebrow="课堂笔记 → 沉淀"
          title="《我的一席》"
        />
        <div className={styles.railBody}>
          {learningMode}
          <section className={styles.mySeatBlock}>
            <span>我的观点（整理草稿）</span>
            <p className={styles.mySeatViewpoint}>{scenario.mySeat.viewpoint}</p>
          </section>
          <section className={styles.mySeatBlock}>
            <span>我的理由</span>
            <p>{scenario.mySeat.reasons}</p>
          </section>
          <section className={styles.mySeatBlock}>
            <span>{real ? "回应中的条件与待澄清处" : "我补上的条件"}</span>
            <p>{scenario.mySeat.addedCondition}</p>
          </section>
          <section className={styles.mySeatBlock}>
            <span>与已有讨论相比</span>
            <p>{scenario.mySeat.delta}</p>
          </section>
          <p className={styles.mySeatNote}>
            这是根据你的观点与回应整理的 AI 草稿，请核对是否忠实；不代表你已经掌握，也不证明观点正确。
          </p>
          {noteProgress}
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.primaryAction} onClick={onClaimSeat}>
            留下我的这一席
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.textAction} onClick={onOpenNote}>
            回看课堂笔记
          </button>
        </footer>
      </aside>
    );
  }

  // ── Phase: seated（双出口）───────────────────────────────
  if (state.phase === "seated") {
    const draftText = [
      scenario.zhihuDraft.title,
      "",
      ...scenario.zhihuDraft.outline.map((item) => `【${item.label}】${item.text}`),
    ].join("\n");

    return (
      <aside className={`${styles.contextRail} ${styles.exitsRail}`} aria-labelledby="exits-title">
        <RailHeader
          id="exits-title"
          eyebrow={`你已入席 · 本班 ${classroom.students.length + 1} 人`}
          title="这一席，接下来可以去两个地方"
        />
        <div className={styles.railBody}>
          {learningMode}
          <section className={styles.exitCard}>
            <div className={styles.exitCardHeading}>
              <span>A</span>
              <div>
                <h3>去知乎写下这一席</h3>
                <p>课堂里完成的是「形成观点」，知乎负责最终「公开表达」。</p>
              </div>
            </div>
            <details className={styles.zhihuDraft}>
              <summary>{real ? "查看三条回答提纲（AI 整理）" : "查看回答提纲（Mock 草稿）"}</summary>
              <div className={styles.zhihuDraftBody}>
                <strong>{scenario.zhihuDraft.title}</strong>
                {scenario.zhihuDraft.outline.map((item) => (
                  <p key={item.label}>
                    <b>{item.label}</b>
                    {item.text}
                  </p>
                ))}
                <small>{scenario.zhihuDraft.note}</small>
              </div>
            </details>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={async () => {
                try {
                  if (!navigator.clipboard) throw new Error("clipboard unavailable");
                  await navigator.clipboard.writeText(draftText);
                  setCopyStatus("copied");
                  window.setTimeout(() => setCopyStatus("idle"), 1600);
                } catch {
                  setCopyStatus("error");
                }
              }}
            >
              {copyStatus === "copied" ? "已复制提纲" : "复制提纲"}
            </button>
            {copyStatus === "error" ? (
              <p className={styles.inlineNotice} role="alert">
                浏览器没有允许复制。请展开提纲后手动复制。
              </p>
            ) : null}
            <a
              className={styles.zhihuAction}
              href={classroom.question.url}
              target="_blank"
              rel="noreferrer"
            >
              打开知乎，亲自完成回答 <span aria-hidden="true">↗</span>
            </a>
          </section>

          <section className={styles.exitCard}>
            <div className={styles.exitCardHeading}>
              <span>B</span>
              <div>
                <h3>去下一间教室</h3>
                <p>一个答案，会继续长出一个新的问题。</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.nextRoomCard}
              onClick={() => onOpenCampusRoom(scenario.nextClassroom.number, false)}
            >
              <span className={styles.nextRoomNumber}>{scenario.nextClassroom.number}</span>
              <span className={styles.nextRoomBody}>
                <strong>{scenario.nextClassroom.title}</strong>
                <small>{scenario.nextClassroom.causalNote}</small>
              </span>
              <i aria-hidden="true">→</i>
            </button>
          </section>
          {noteProgress}
        </div>
        <footer className={styles.railFooter}>
          <button type="button" className={styles.textAction} onClick={onReset}>
            重新开始这节课
          </button>
        </footer>
      </aside>
    );
  }

  // ── Phase: exploring（默认 overview）─────────────────────
  return (
    <aside className={styles.contextRail} aria-labelledby="overview-panel-title">
      <RailHeader
        id="overview-panel-title"
        eyebrow="Classroom 101 · 正在上课"
        title="先认识这间像素教室"
      />
      <div className={styles.railBody}>
        <p className={styles.railLead}>
          每位像素学生代表一条来源。学生围桌而坐；位置越近，论证越相似。
        </p>
        <div className={styles.overviewStats}>
          <span><strong>{classroom.students.length}</strong> 位学生</span>
          <span><strong>{classroom.clusters.length}</strong> 个学习组</span>
        </div>
        <div className={styles.clusterIndex} aria-label="观点组">
          {classroom.clusters.map((cluster, index) => (
            <button
              id={`cluster-trigger-${cluster.id}`}
              type="button"
              key={cluster.id}
              onClick={() => onSelectCluster(cluster.id)}
            >
              <i className={styles[`clusterColor${index + 1}`]} />
              <span>{cluster.label}</span>
              <small>{cluster.studentIds.length} 位</small>
            </button>
          ))}
        </div>
        <div className={styles.nextStep}>
          <span>01</span>
          <p>点一位学生，看他的桌组、观点和证据。</p>
        </div>
        <div className={styles.nextStep}>
          <span>02</span>
          <p>听各组课代表交流，再写下你怎么看。</p>
        </div>
        <p className={styles.campusHint}>
          门外还有 Classroom 102–103；102 是本班「尚未解决的问题」长出来的下一间教室。
        </p>
      </div>
      <footer className={styles.railFooter}>
        <button type="button" className={styles.primaryAction} onClick={onStartRoundtable}>
          听听各组怎么说
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </aside>
  );
}

function NoteProgressStrip({
  state,
  onOpenNote,
}: {
  state: SessionState;
  onOpenNote: () => void;
}) {
  const sections = noteSectionStatus(state.phase);
  const items = [
    { key: "before", label: "上课前", state: sections.before },
    { key: "heard", label: "我听到了", state: sections.heard },
    { key: "changed", label: "重新思考", state: sections.changed },
    { key: "after", label: "现在认为", state: sections.after },
  ];
  const allReady = items.every((item) => item.state === "ready");

  return (
    <div className={styles.noteStrip}>
      <div className={styles.noteStripHeader}>
        <span>课堂笔记 · 生长中</span>
        {allReady ? (
          <button type="button" onClick={onOpenNote}>
            查看完整笔记 →
          </button>
        ) : null}
      </div>
      <ol>
        {items.map((item) => (
          <li
            key={item.key}
            className={item.state === "ready" ? styles.noteStripDone : styles.noteStripLocked}
          >
            <i aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CandidateEvidenceItem({
  index,
  label,
  explanation,
  evidenceIds,
  classroom,
  result,
}: {
  index: number;
  label: string;
  explanation: string;
  evidenceIds: string[];
  classroom: Classroom;
  result: AnalysisResult;
}) {
  const details = evidenceIds.flatMap((evidenceId) => {
    const evidence = result.evidence.find((item) => item.id === evidenceId);
    if (!evidence) return [];
    if (evidence.kind === "note_excerpt") {
      const excerpt = evidence.text.length > 68
        ? `${evidence.text.slice(0, 68)}…`
        : evidence.text;
      return [`${evidence.id} · 你的笔记 ${evidence.start}–${evidence.end} 字：「${excerpt}」`];
    }
    const source = classroom.sources.find(
      (item) => item.id === evidence.sourceContentId,
    );
    return [`${evidence.id} · ${source?.title ?? evidence.sourceContentId}：「${evidence.text}」`];
  });

  return (
    <div>
      <span>{index}</span>
      <div>
        <strong>{label}</strong>
        <p>{explanation}</p>
        <ul className={styles.candidateEvidenceSources}>
          {details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      </div>
    </div>
  );
}

function RailHeader({ id, eyebrow, title }: { id: string; eyebrow: string; title: string }) {
  return (
    <header className={styles.railHeader}>
      <p className={styles.sheetEyebrow}>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}
