"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, {
  type ForceGraphMethods,
  type GraphData,
  type NodeObject,
} from "react-force-graph-2d";

import type { Classroom } from "@/domain/schemas";

import {
  getStudentDetails,
  studentSeatNumber,
} from "./classroom-selectors";
import styles from "./classroom.module.css";

const CLUSTER_COLORS = [
  "#637F96",
  "#5E8B83",
  "#8075A1",
  "#9A7C58",
  "#9B6F78",
] as const;

type GraphNode = {
  id: string;
  studentId: string;
  seatNumber: string;
  clusterId: string;
  color: string;
  displaySeed: number;
};

type ForceGraphCanvasProps = {
  classroom: Classroom;
  width: number;
  height: number;
  selectedStudentId: string | null;
  candidateVisible: boolean;
  candidatePosition: { x: number; y: number };
  seatmateStudentId: string;
  onSelectStudent: (studentId: string) => void;
};

function hexWithAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export default function ForceGraphCanvas({
  classroom,
  width,
  height,
  selectedStudentId,
  candidateVisible,
  candidatePosition,
  seatmateStudentId,
  onSelectStudent,
}: ForceGraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const fitPadding = width < 500 ? 8 : 52;
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(
    null,
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [candidateRevealProgress, setCandidateRevealProgress] = useState(0);

  const colorByClusterId = useMemo(
    () =>
      new Map(
        classroom.clusters.map((cluster, index) => [
          cluster.id,
          CLUSTER_COLORS[index % CLUSTER_COLORS.length],
        ]),
      ),
    [classroom.clusters],
  );

  const graphData = useMemo<GraphData<GraphNode>>(
    () => ({
      nodes: classroom.students.map((student) => {
        const clusterId =
          student.assignment.kind === "cluster"
            ? student.assignment.clusterId
            : "independent";

        return {
          id: student.id,
          studentId: student.id,
          seatNumber: studentSeatNumber(classroom, student.id),
          clusterId,
          color: colorByClusterId.get(clusterId) ?? "#627080",
          displaySeed: student.displaySeed,
          x: student.layout.x,
          y: student.layout.y,
          fx: student.layout.x,
          fy: student.layout.y,
        };
      }),
      links: [],
    }),
    [classroom, colorByClusterId],
  );

  const clusterCenters = useMemo(
    () =>
      classroom.clusters.map((cluster, index) => ({
        x: cluster.layout.centerX,
        y: cluster.layout.centerY,
        color: CLUSTER_COLORS[index % CLUSTER_COLORS.length],
        label: cluster.label,
        count: cluster.studentIds.length,
      })),
    [classroom.clusters],
  );

  const hovered = hoveredStudentId
    ? getStudentDetails(classroom, hoveredStudentId)
    : null;

  const seatmateStudent = classroom.students.find(
    (student) => student.id === seatmateStudentId,
  );

  useEffect(() => {
    graphRef.current?.zoomToFit(0, fitPadding);
  }, [fitPadding, height, width]);

  useEffect(() => {
    let frameId = 0;

    if (!candidateVisible) {
      frameId = window.requestAnimationFrame(() => setCandidateRevealProgress(0));
      return () => window.cancelAnimationFrame(frameId);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameId = window.requestAnimationFrame(() => setCandidateRevealProgress(1));
      return () => window.cancelAnimationFrame(frameId);
    }

    const startedAt = performance.now();

    const reveal = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / 320);
      setCandidateRevealProgress(progress);
      if (progress < 1) frameId = window.requestAnimationFrame(reveal);
    };

    frameId = window.requestAnimationFrame(reveal);
    return () => window.cancelAnimationFrame(frameId);
  }, [candidateVisible]);

  function paintStudent(
    node: NodeObject<GraphNode>,
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      return;
    }

    const unit = 1 / globalScale;
    const isSelected = node.studentId === selectedStudentId;
    const isHovered = node.studentId === hoveredStudentId;
    const isSeatmate = candidateVisible && node.studentId === seatmateStudentId;
    const isMuted = Boolean(selectedStudentId && !isSelected);
    const lookDirection = node.displaySeed % 3 === 0 ? -1 : node.displaySeed % 3 === 1 ? 1 : 0;
    const propKind = node.displaySeed % 3;

    context.save();
    context.globalAlpha = isMuted ? 0.38 : 1;
    context.translate(node.x, node.y);

    if (isSelected || isSeatmate) {
      context.beginPath();
      context.ellipse(0, 7 * unit, 16 * unit, 9 * unit, 0, 0, Math.PI * 2);
      context.fillStyle = isSeatmate ? "#D5912A22" : `${node.color}22`;
      context.fill();
      context.lineWidth = (isSelected ? 2 : 1.5) * unit;
      context.strokeStyle = isSeatmate ? "#D5912A" : "#19232E";
      context.stroke();
    }

    // Chair back and compact desk establish a seated body, not an avatar dot.
    context.lineWidth = 1.25 * unit;
    context.strokeStyle = "#8D8578";
    context.beginPath();
    context.moveTo(-5 * unit, 0);
    context.lineTo(-5 * unit, 11 * unit);
    context.moveTo(5 * unit, 0);
    context.lineTo(5 * unit, 11 * unit);
    context.stroke();

    context.fillStyle = isSeatmate ? "#FFF4DE" : "#EEE7DA";
    context.strokeStyle = isSeatmate ? "#D5912A" : "#B9B0A2";
    context.lineWidth = 1.1 * unit;
    context.beginPath();
    context.roundRect(-10 * unit, 3 * unit, 20 * unit, 7 * unit, 2 * unit);
    context.fill();
    context.stroke();

    // Torso uses cluster color as a small, equal-weight identity cue.
    context.fillStyle = node.color;
    context.strokeStyle = "#19232E";
    context.lineWidth = (isSelected || isHovered ? 1.4 : 0.8) * unit;
    context.beginPath();
    context.roundRect(-5.3 * unit, -5 * unit, 10.6 * unit, 10 * unit, 3 * unit);
    context.fill();
    context.stroke();

    // Arms react to selection and to the newly revealed neighbor relation.
    context.strokeStyle = "#19232E";
    context.lineWidth = 1.4 * unit;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-4 * unit, -1 * unit);
    context.lineTo(-7.5 * unit, 3 * unit);
    context.moveTo(4 * unit, -1 * unit);
    if (isSeatmate) {
      context.lineTo(8 * unit, -7 * unit);
      context.lineTo(10 * unit, -9 * unit);
    } else if (isSelected) {
      context.lineTo(7 * unit, -5 * unit);
    } else {
      context.lineTo(7.5 * unit, 3 * unit);
    }
    context.stroke();

    const headX = (isSelected || isSeatmate ? 1 : lookDirection) * unit;
    const headY = (isSelected || isSeatmate ? -11 : -10) * unit;
    context.fillStyle = "#F3CDB1";
    context.strokeStyle = "#19232E";
    context.lineWidth = 0.9 * unit;
    context.beginPath();
    context.arc(headX, headY, 4.5 * unit, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.fillStyle = "#3D332D";
    context.beginPath();
    if (node.displaySeed % 2 === 0) {
      context.arc(headX, headY - 1.3 * unit, 4.6 * unit, Math.PI, Math.PI * 2);
    } else {
      context.roundRect(headX - 4.2 * unit, headY - 4.6 * unit, 8.4 * unit, 2.8 * unit, unit);
    }
    context.fill();

    context.fillStyle = "#19232E";
    context.beginPath();
    context.arc(headX + lookDirection * 0.5 * unit - 1.2 * unit, headY + 0.4 * unit, 0.55 * unit, 0, Math.PI * 2);
    context.arc(headX + lookDirection * 0.5 * unit + 1.2 * unit, headY + 0.4 * unit, 0.55 * unit, 0, Math.PI * 2);
    context.fill();

    // A book, notebook, or laptop supplies low-cost individual life cues.
    context.strokeStyle = node.color;
    context.fillStyle = "#FFFCF6";
    context.lineWidth = 0.9 * unit;
    context.beginPath();
    if (propKind === 0) {
      context.roundRect(-5 * unit, 4.2 * unit, 10 * unit, 3.5 * unit, unit);
    } else if (propKind === 1) {
      context.moveTo(-5 * unit, 7 * unit);
      context.lineTo(-3 * unit, 3.5 * unit);
      context.lineTo(4.5 * unit, 3.5 * unit);
      context.lineTo(5 * unit, 7 * unit);
      context.closePath();
    } else {
      context.roundRect(-4 * unit, 4 * unit, 8 * unit, 4 * unit, 0.7 * unit);
    }
    context.fill();
    context.stroke();

    context.fillStyle = isSeatmate ? "#D5912A" : "#42505E";
    context.font = `600 ${7.5 * unit}px ui-sans-serif, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(node.seatNumber, 0, 14 * unit);

    if (isSeatmate) {
      context.fillStyle = "#D5912A";
      context.beginPath();
      context.arc(11 * unit, -13 * unit, 5 * unit, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#FFFCF6";
      context.font = `700 ${6.5 * unit}px ui-sans-serif, system-ui`;
      context.fillText("同桌", 11 * unit, -13 * unit);
    }
    context.restore();
  }

  function paintPointerArea(
    node: NodeObject<GraphNode>,
    paintColor: string,
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      return;
    }

    context.fillStyle = paintColor;
    context.beginPath();
    context.arc(node.x, node.y, 23 / globalScale, 0, Math.PI * 2);
    context.fill();
  }

  function paintClusterZones(
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    // A restrained blackboard and floor zoning shift the first read toward Classroom.
    context.fillStyle = "#34463F";
    context.strokeStyle = "#9E9484";
    context.lineWidth = 1 / globalScale;
    context.beginPath();
    context.roundRect(36, 3, 28, 7, 1.2);
    context.fill();
    context.stroke();
    context.fillStyle = "#F6F2E8";
    context.font = `600 ${8 / globalScale}px ui-sans-serif, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("问题黑板", 50, 6.5);

    for (const center of clusterCenters) {
      context.beginPath();
      context.ellipse(center.x, center.y + 1, 15.5, 13.5, 0, 0, Math.PI * 2);
      context.fillStyle = hexWithAlpha(center.color, "0E");
      context.fill();
      context.lineWidth = 1 / globalScale;
      context.strokeStyle = hexWithAlpha(center.color, "35");
      context.setLineDash([5 / globalScale, 7 / globalScale]);
      context.stroke();
      context.setLineDash([]);

      const label = `${center.label} · ${center.count} 位`;
      context.font = `600 ${10 / globalScale}px ui-sans-serif, system-ui`;
      const labelWidth = context.measureText(label).width;
      const labelX = center.x - labelWidth / 2;
      const labelY = center.y < 30 ? center.y + 18 : center.y - 18;
      context.fillStyle = "#F6F2E8E8";
      context.fillRect(
        labelX - 4 / globalScale,
        labelY - 9 / globalScale,
        labelWidth + 8 / globalScale,
        14 / globalScale,
      );
      context.fillStyle = "#42505E";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(label, labelX, labelY - 2 / globalScale);
    }

    if (candidateVisible && seatmateStudent) {
      context.beginPath();
      context.moveTo(candidatePosition.x, candidatePosition.y);
      context.lineTo(seatmateStudent.layout.x, seatmateStudent.layout.y);
      context.setLineDash([4 / globalScale, 5 / globalScale]);
      context.lineWidth = 1.4 / globalScale;
      context.strokeStyle = "#D5912AAA";
      context.stroke();
      context.setLineDash([]);
    }
  }

  function paintCandidateSeat(context: CanvasRenderingContext2D, globalScale: number) {
    if (!candidateVisible) return;
    const unit = 1 / globalScale;
    const easedProgress = 1 - Math.pow(1 - candidateRevealProgress, 3);
    context.save();
    context.translate(candidatePosition.x, candidatePosition.y);
    context.globalAlpha = easedProgress;
    context.scale(0.88 + easedProgress * 0.12, 0.88 + easedProgress * 0.12);
    if (candidateRevealProgress < 1) {
      context.beginPath();
      context.arc(0, 1 * unit, (16 + candidateRevealProgress * 8) * unit, 0, Math.PI * 2);
      context.fillStyle = `rgba(213, 145, 42, ${0.2 * (1 - candidateRevealProgress)})`;
      context.fill();
    }
    context.fillStyle = "#FFF8E9";
    context.strokeStyle = "#D5912A";
    context.lineWidth = 2 * unit;
    context.beginPath();
    context.roundRect(-12 * unit, -4 * unit, 24 * unit, 10 * unit, 2.5 * unit);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(-8 * unit, 6 * unit);
    context.lineTo(-8 * unit, 12 * unit);
    context.moveTo(8 * unit, 6 * unit);
    context.lineTo(8 * unit, 12 * unit);
    context.stroke();
    context.fillStyle = "#D5912A";
    context.beginPath();
    context.arc(0, -10 * unit, 4.5 * unit, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#FFFCF6";
    context.font = `700 ${7 * unit}px ui-sans-serif, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("你", 0, -10 * unit);
    context.fillStyle = "#8A5A16";
    context.font = `650 ${8 * unit}px ui-sans-serif, system-ui`;
    context.fillText("你的一席", 0, 17 * unit);
    context.restore();
  }

  function handleHover(node: NodeObject<GraphNode> | null) {
    setHoveredStudentId(node?.studentId ?? null);

    if (
      node &&
      typeof node.x === "number" &&
      typeof node.y === "number" &&
      graphRef.current
    ) {
      const position = graphRef.current.graph2ScreenCoords(node.x, node.y);
      setTooltipPosition({
        x: Math.min(Math.max(16, position.x), Math.max(16, width - 296)),
        y: Math.max(116, position.y),
      });
    }
  }

  return (
    <div className={styles.canvasViewport} aria-hidden="true">
      <ForceGraph2D<GraphNode>
        ref={graphRef}
        width={width}
        height={height}
        graphData={graphData}
        backgroundColor="#F6F2E8"
        cooldownTicks={0}
        warmupTicks={0}
        enableNodeDrag={false}
        enablePanInteraction={false}
        enableZoomInteraction={false}
        nodeLabel={() => ""}
        nodeCanvasObject={paintStudent}
        nodePointerAreaPaint={paintPointerArea}
        onRenderFramePre={paintClusterZones}
        onRenderFramePost={paintCandidateSeat}
        onNodeHover={handleHover}
        onNodeClick={(node) => {
          setHoveredStudentId(null);
          onSelectStudent(node.studentId);
        }}
        onEngineStop={() => graphRef.current?.zoomToFit(0, fitPadding)}
      />

      {hovered ? (
        <div
          className={styles.canvasTooltip}
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <span className={styles.tooltipEyebrow}>
            学生 {studentSeatNumber(classroom, hovered.student.id)} ·{" "}
            {hovered.cluster?.label ?? "独立观点"}
          </span>
          <strong>{hovered.source.author.displayName}</strong>
          <span>{hovered.argument.conclusion}</span>
        </div>
      ) : null}
    </div>
  );
}
