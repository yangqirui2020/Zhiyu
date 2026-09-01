"use client";

import type { Classroom } from "@/domain/schemas";
import type { DemoScenarioV3 } from "../../../data/fixtures/scenarios/learn-programming-demo-v3";

import { getStudentDetails } from "./classroom-selectors";
import {
  PixelStudentPortrait,
  PIXEL_CLUSTER_COLORS,
} from "./PixelStudentPortrait";
import styles from "./classroom.module.css";

type RoundtableOverlayProps = {
  classroom: Classroom;
  scenario: DemoScenarioV3;
  /** 当前发言序号；等于发言人总数表示圆桌收尾中 */
  currentStep: number;
  onSkip: () => void;
};

/**
 * 课代表圆桌：发生在教室舞台内的结构化跨组碰撞。
 * 全部台词预生成；一轮结束自动把三项结论写上黑板。
 */
export function RoundtableOverlay({
  classroom,
  scenario,
  currentStep,
  onSkip,
}: RoundtableOverlayProps) {
  const speakers = scenario.roundtable.speakers;
  const totalSpeakers = speakers.length;
  const activeSpeaker = currentStep < totalSpeakers ? speakers[currentStep] : null;
  const activeDetails = activeSpeaker
    ? getStudentDetails(classroom, activeSpeaker.studentId)
    : null;
  const activeClusterIndex = activeSpeaker
    ? classroom.clusters.findIndex((cluster) => cluster.id === activeSpeaker.clusterId)
    : -1;
  const activeColor =
    PIXEL_CLUSTER_COLORS[
      Math.max(0, activeClusterIndex) % PIXEL_CLUSTER_COLORS.length
    ];

  return (
    <section
      className={styles.roundtableOverlay}
      aria-label="课代表圆桌"
      aria-live="polite"
    >
      <div className={styles.roundtableHeading}>
        <span className={styles.roundtableKicker}>课代表圆桌 · 一轮</span>
        <span className={styles.roundtableFacilitation}>
          {scenario.roundtable.facilitation}
        </span>
      </div>

      {activeSpeaker && activeDetails ? (
        <div className={styles.roundtableSpeakerRow} key={activeSpeaker.studentId}>
          <div className={styles.roundtablePortrait}>
            <PixelStudentPortrait
              seed={activeDetails.student.displaySeed}
              color={activeColor}
              role="representative"
              label={`${activeDetails.cluster?.label ?? "观点组"}课代表`}
            />
          </div>
          <div className={styles.roundtableBubble}>
            <span className={styles.roundtableClusterTag} style={{ borderColor: activeColor, color: activeColor }}>
              {activeDetails.cluster?.label ?? "观点组"}
            </span>
            <p className={styles.roundtableLine}>{activeSpeaker.line}</p>
          </div>
        </div>
      ) : (
        <div className={styles.roundtableSpeakerRow}>
          <div className={styles.roundtableBubble}>
            <p className={styles.roundtableLine}>各组观点已经摆到同一张桌子上，正在写上黑板……</p>
          </div>
        </div>
      )}

      <div className={styles.roundtableFooter}>
        <div className={styles.roundtableProgress} aria-label={`圆桌进度 ${Math.min(currentStep + 1, totalSpeakers)}/${totalSpeakers}`}>
          {speakers.map((speaker, index) => (
            <i
              key={speaker.studentId}
              className={
                index < currentStep
                  ? styles.roundtableDotDone
                  : index === currentStep
                    ? styles.roundtableDotActive
                    : styles.roundtableDot
              }
            />
          ))}
        </div>
        <span className={styles.roundtableDisclosure}>
          预生成讨论 · 课代表为 AI 归纳 · 非任何真实答主 · 不代表知乎立场
        </span>
        <button type="button" className={styles.roundtableSkip} onClick={onSkip}>
          跳过，直接看黑板
        </button>
      </div>
    </section>
  );
}
