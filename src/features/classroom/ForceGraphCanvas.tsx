"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods, type GraphData, type NodeObject } from "react-force-graph-2d";
import type { Classroom } from "@/domain/schemas";
import { getStudentDetails, studentSeatNumber } from "./classroom-selectors";
import { paintPixelCandidateSeat, paintPixelSeatedUser, paintPixelStudent } from "./pixel-character";
import { classroomPresentation } from "./presentation-layout";
import styles from "./classroom.module.css";

const COLORS = ["#637F96", "#5E8B83", "#8075A1", "#9A7C58", "#9B6F78"];
type GraphNode = { id: string; studentId: string; seatNumber: string; clusterId: string; color: string; displaySeed: number; entryIndex: number };
type Props = {
  classroom: Classroom; width: number; height: number; selectedStudentId: string | null;
  candidateVisible: boolean; candidatePosition: { x: number; y: number }; seatmateStudentId: string; seatClaimed: boolean; blackboardExpanded: boolean;
  blackboardExtraHeight?: number;
  roundtable: { active: boolean; speakerIds: string[]; currentSpeakerId: string | null };
  onSelectStudent: (studentId: string) => void;
};

export default function ForceGraphCanvas({ classroom, width, height, selectedStudentId, candidateVisible, seatmateStudentId, seatClaimed, blackboardExpanded, blackboardExtraHeight = 0, roundtable, onSelectStudent }: Props) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const presentation = useMemo(() => classroomPresentation(classroom, width, height, blackboardExpanded, blackboardExtraHeight), [classroom, width, height, blackboardExpanded, blackboardExtraHeight]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [entrance, setEntrance] = useState(0);
  const [candidateReveal, setCandidateReveal] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hovered = hoveredId ? getStudentDetails(classroom, hoveredId) : null;
  const selectedCluster = getStudentDetails(classroom, selectedStudentId ?? "")?.cluster?.id;
  const graphData = useMemo<GraphData<GraphNode>>(() => ({ nodes: classroom.students.map((student, entryIndex) => {
    const clusterId = student.assignment.kind === "cluster" ? student.assignment.clusterId : "independent";
    const index = classroom.clusters.findIndex(group => group.id === clusterId);
    const position = presentation.people.get(student.id)!;
    return { id: student.id, studentId: student.id, seatNumber: studentSeatNumber(classroom, student.id), clusterId, color: COLORS[Math.max(index, 0) % COLORS.length], displaySeed: student.displaySeed, entryIndex, x: position.x, y: position.y, fx: position.x, fy: position.y };
  }), links: [] }), [classroom, presentation]);
  const fitStage = useCallback(() => { graphRef.current?.zoom(1, 0); graphRef.current?.centerAt(width / 2, height / 2, 0); }, [width, height]);
  useEffect(() => { fitStage(); }, [fitStage, blackboardExpanded]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    let frame = 0;
    const key = `zhiyu-classroom-entered:${classroom.question.id}:${classroom.revision}`;
    let entered = false;
    try { entered = sessionStorage.getItem(key) === "1"; } catch { /* A blocked browser storage must not block the lesson. */ }
    const start = performance.now();
    const animate = (now: number) => {
      const progress = reducedMotion || entered ? 1 : Math.min(1, (now - start) / 1800);
      setEntrance(progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else { try { sessionStorage.setItem(key, "1"); } catch { /* The state is optional. */ } }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [classroom.question.id, classroom.revision, reducedMotion]);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = !candidateVisible ? 0 : reducedMotion ? 1 : Math.min(1, (now - start) / 1500);
      setCandidateReveal(progress);
      if (candidateVisible && progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [candidateVisible, reducedMotion]);

  function paintStudent(node: NodeObject<GraphNode>, context: CanvasRenderingContext2D, scale: number) {
    if (node.x === undefined || node.y === undefined) return;
    const progress = Math.max(0, Math.min(1, (entrance - Math.floor(node.entryIndex / 8) * .08) / .7));
    const eased = 1 - (1 - progress) ** 3;
    context.save();
    context.translate((width - 40) + (node.x - width + 40) * eased, (height - 40) + (node.y - height + 40) * eased);
    const speaker = roundtable.active && roundtable.speakerIds.includes(node.id);
    paintPixelStudent(context, scale / presentation.characterScale, {
      color: node.color, seed: node.displaySeed, seatNumber: node.seatNumber,
      selected: node.id === selectedStudentId || (roundtable.active && node.id === roundtable.currentSpeakerId),
      hovered: node.id === hoveredId, inFocusedGroup: node.clusterId === selectedCluster || speaker,
      seatmate: candidateVisible && node.id === seatmateStudentId, related: false,
      muted: (roundtable.active && !speaker) || Boolean(selectedStudentId && node.id !== selectedStudentId && node.clusterId !== selectedCluster),
      opacity: progress, lifeFrame: 0, reducedMotion: true,
    });
    context.restore();
  }
  function paintScene(context: CanvasRenderingContext2D) {
    context.save(); context.imageSmoothingEnabled = false;
    context.fillStyle = "#F1E9DA"; context.fillRect(0, 0, width, height);
    context.strokeStyle = "rgba(125,111,91,.12)"; context.lineWidth = .6;
    for (let x = 0; x <= width; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    for (let y = 0; y <= height; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); }
    for (const [index, group] of presentation.groups.entries()) {
      const color = COLORS[index % COLORS.length];
      context.save(); context.globalAlpha = Math.min(1, entrance * 2);
      context.fillStyle = `${color}16`; context.strokeStyle = `${color}65`; context.lineWidth = 1.2;
      context.beginPath(); context.roundRect(group.x - group.width / 2, group.y - group.height / 2, group.width, group.height, 8); context.fill(); context.stroke();
      for (let row = 0; row < group.rows; row++) {
        const y = group.y + (row - (group.rows - 1) / 2) * group.spacingY + 24;
        context.fillStyle = "#A99479"; context.fillRect(group.x - group.width / 2 + 16, y, group.width - 32, 7);
        context.fillStyle = "#D8CCBA"; context.fillRect(group.x - group.width / 2 + 18, y + 1, group.width - 36, 3);
      }
      context.font = `600 ${width < 500 ? 10 : 13}px ui-sans-serif, system-ui`;
      context.fillStyle = "#27333E"; context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText(group.label, group.x, group.y - group.height / 2 + 13);
      context.font = `${width < 500 ? 9 : 11}px ui-sans-serif, system-ui`; context.fillStyle = color;
      context.fillText(`${group.studentIds.length} 位 · ${classroom.provenance.mode === "mock" ? "合成观点" : "真实摘要"}`, group.x, group.y - group.height / 2 + 28);
      context.restore();
    }
    const peer = presentation.people.get(seatmateStudentId);
    if (candidateVisible && peer && candidateReveal > .6) {
      context.beginPath(); context.moveTo(presentation.candidate.x, presentation.candidate.y); context.lineTo(peer.x, peer.y);
      context.setLineDash([4, 4]); context.strokeStyle = "#D5912A99"; context.lineWidth = 2; context.stroke(); context.setLineDash([]);
    }
    context.restore();
  }
  function paintCandidate(context: CanvasRenderingContext2D, scale: number) {
    if (!candidateVisible) return;
    context.save();
    context.translate(presentation.candidate.x, presentation.candidate.y);
    if (seatClaimed) paintPixelSeatedUser(context, scale / presentation.characterScale, 1, 0, true);
    else paintPixelCandidateSeat(context, scale / presentation.characterScale, candidateReveal);
    context.restore();
  }
  const tooltip = hoveredId ? presentation.people.get(hoveredId) : null;
  return <div className={styles.canvasViewport} aria-hidden="true">
    <ForceGraph2D<GraphNode> ref={graphRef} width={width} height={height} graphData={graphData} backgroundColor="#F1E9DA" cooldownTicks={0} warmupTicks={0}
      enableNodeDrag={false} enablePanInteraction={false} enableZoomInteraction={false} nodeLabel={() => ""}
      nodeCanvasObject={paintStudent}
      nodePointerAreaPaint={(node, color, context) => { if (entrance < 1 || node.x === undefined || node.y === undefined) return; const size = Math.max(44, 36 * presentation.characterScale); context.fillStyle = color; context.fillRect(node.x - size / 2, node.y - size / 2, size, size); }}
      onRenderFramePre={paintScene} onRenderFramePost={paintCandidate} onNodeHover={node => setHoveredId(node?.id ?? null)}
      onNodeClick={node => { setHoveredId(null); onSelectStudent(node.id); }} onEngineStop={fitStage} />
    {hovered && tooltip ? <div className={styles.canvasTooltip} style={{ left: Math.min(Math.max(8, tooltip.x - 100), width - 290), top: Math.max(150, tooltip.y - 18) }}>
      <span className={styles.tooltipEyebrow}>学生 {studentSeatNumber(classroom, hovered.student.id)} · {hovered.cluster?.label ?? "独立观点"}</span>
      <strong>{hovered.source.author.displayName}</strong><span>{hovered.argument.conclusion}</span>
    </div> : null}
  </div>;
}
