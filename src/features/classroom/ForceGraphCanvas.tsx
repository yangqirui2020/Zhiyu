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
import {
  paintPixelCandidateSeat,
  paintPixelSeatedUser,
  paintPixelStudent,
} from "./pixel-character";
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
  seatClaimed: boolean;
  blackboardExpanded: boolean;
  roundtable: {
    active: boolean;
    speakerIds: string[];
    currentSpeakerId: string | null;
  };
  onSelectStudent: (studentId: string) => void;
};

function hexWithAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

function paintClippedZone(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cut: number,
) {
  context.beginPath();
  context.moveTo(x + cut, y);
  context.lineTo(x + width - cut, y);
  context.lineTo(x + width, y + cut);
  context.lineTo(x + width, y + height - cut);
  context.lineTo(x + width - cut, y + height);
  context.lineTo(x + cut, y + height);
  context.lineTo(x, y + height - cut);
  context.lineTo(x, y + cut);
  context.closePath();
}

export default function ForceGraphCanvas({
  classroom,
  width,
  height,
  selectedStudentId,
  candidateVisible,
  candidatePosition,
  seatmateStudentId,
  seatClaimed,
  blackboardExpanded,
  roundtable,
  onSelectStudent,
}: ForceGraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const fitPadding = width < 500 ? 12 : 42;
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [candidateRevealProgress, setCandidateRevealProgress] = useState(0);
  const [seatRevealProgress, setSeatRevealProgress] = useState(0);
  const [lifeFrame, setLifeFrame] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const blackboardAnchorY = blackboardExpanded
    ? width < 500
      ? -42
      : -18
    : width < 500
      ? -14
      : -7;
  const floorSafeAnchorY = width < 500 ? 96 : blackboardExpanded ? 102 : 98;

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
      nodes: [
        {
          id: "__blackboard_anchor",
          studentId: "__blackboard_anchor",
          seatNumber: "",
          clusterId: "anchor",
          color: "transparent",
          displaySeed: 0,
          x: 50,
          y: blackboardAnchorY,
          fx: 50,
          fy: blackboardAnchorY,
        },
        {
          id: "__floor_safe_anchor",
          studentId: "__floor_safe_anchor",
          seatNumber: "",
          clusterId: "anchor",
          color: "transparent",
          displaySeed: 0,
          x: 50,
          y: floorSafeAnchorY,
          fx: 50,
          fy: floorSafeAnchorY,
        },
        ...classroom.students.map((student) => {
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
        // 隐形锚点：让 zoomToFit 在候选座出现后把它纳入取景，避免贴边裁切
        ...(candidateVisible
          ? [{
              id: "__candidate_anchor",
              studentId: "__candidate_anchor",
              seatNumber: "",
              clusterId: "anchor",
              color: "transparent",
              displaySeed: 0,
              x: candidatePosition.x,
              y: candidatePosition.y + 4,
              fx: candidatePosition.x,
              fy: candidatePosition.y + 4,
            }]
          : []),
      ],
      links: [],
    }),
    [
      blackboardAnchorY,
      classroom,
      colorByClusterId,
      candidateVisible,
      candidatePosition,
      floorSafeAnchorY,
    ],
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

  const selectedStudent = selectedStudentId
    ? classroom.students.find((student) => student.id === selectedStudentId)
    : undefined;
  const selectedClusterId =
    selectedStudent?.assignment.kind === "cluster"
      ? selectedStudent.assignment.clusterId
      : null;
  const seatmateStudent = classroom.students.find(
    (student) => student.id === seatmateStudentId,
  );
  const seatmateClusterId =
    seatmateStudent?.assignment.kind === "cluster"
      ? seatmateStudent.assignment.clusterId
      : null;
  const hovered = hoveredStudentId
    ? getStudentDetails(classroom, hoveredStudentId)
    : null;

  useEffect(() => {
    graphRef.current?.zoomToFit(0, fitPadding);
  }, [blackboardExpanded, fitPadding, height, width]);

  // 候选座出现 / 入席后重新取景，把琥珀座位纳入画面
  useEffect(() => {
    const timer = window.setTimeout(
      () => graphRef.current?.zoomToFit(380, fitPadding),
      80,
    );
    return () => window.clearTimeout(timer);
  }, [blackboardExpanded, candidateVisible, seatClaimed, fitPadding]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(media.matches);
    syncPreference();
    media.addEventListener("change", syncPreference);

    if (media.matches) {
      return () => media.removeEventListener("change", syncPreference);
    }

    const timer = window.setInterval(() => {
      setLifeFrame((frame) => (frame + 1) % 117);
    }, 860);

    return () => {
      window.clearInterval(timer);
      media.removeEventListener("change", syncPreference);
    };
  }, [reducedMotion]);

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

  useEffect(() => {
    let frameId = 0;

    if (!seatClaimed) {
      frameId = window.requestAnimationFrame(() => setSeatRevealProgress(0));
      return () => window.cancelAnimationFrame(frameId);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frameId = window.requestAnimationFrame(() => setSeatRevealProgress(1));
      return () => window.cancelAnimationFrame(frameId);
    }

    const startedAt = performance.now();
    const reveal = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / 420);
      setSeatRevealProgress(progress);
      if (progress < 1) frameId = window.requestAnimationFrame(reveal);
    };

    frameId = window.requestAnimationFrame(reveal);
    return () => window.cancelAnimationFrame(frameId);
  }, [seatClaimed]);

  function paintStudent(
    node: NodeObject<GraphNode>,
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (node.clusterId === "anchor") return;
    if (typeof node.x !== "number" || typeof node.y !== "number") return;

    const isSelected = node.studentId === selectedStudentId;
    const isSeatmate = candidateVisible && node.studentId === seatmateStudentId;
    const isInFocusedGroup = Boolean(
      selectedClusterId && node.clusterId === selectedClusterId,
    );
    const isRelated = Boolean(
      candidateVisible &&
        seatmateClusterId &&
        node.clusterId === seatmateClusterId &&
        Math.hypot(node.x - candidatePosition.x, node.y - candidatePosition.y) < 22,
    );
    // 课代表圆桌：发言人聚焦，其余课代表保持可读，普通学生降噪
    const isSpeaker = roundtable.active && roundtable.speakerIds.includes(node.studentId);
    const isCurrentSpeaker =
      roundtable.active && node.studentId === roundtable.currentSpeakerId;
    const mutedByRoundtable = roundtable.active && !isSpeaker;

    context.save();
    context.translate(node.x, node.y);
    paintPixelStudent(context, globalScale, {
      color: node.color,
      seed: node.displaySeed,
      seatNumber: node.seatNumber,
      selected: isSelected || isCurrentSpeaker,
      hovered: node.studentId === hoveredStudentId,
      inFocusedGroup:
        (isInFocusedGroup && !isSelected) || (isSpeaker && !isCurrentSpeaker),
      seatmate: isSeatmate,
      related: isRelated && !isSeatmate,
      muted:
        mutedByRoundtable ||
        Boolean(selectedStudentId && !isSelected && !isInFocusedGroup),
      lifeFrame,
      reducedMotion,
    });
    context.restore();
  }

  function paintPointerArea(
    node: NodeObject<GraphNode>,
    paintColor: string,
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (node.clusterId === "anchor") return;
    if (typeof node.x !== "number" || typeof node.y !== "number") return;
    context.fillStyle = paintColor;
    context.fillRect(
      node.x - 23 / globalScale,
      node.y - 23 / globalScale,
      46 / globalScale,
      46 / globalScale,
    );
  }

  function paintClassroomScene(
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    const unit = 1 / globalScale;
    context.save();
    context.imageSmoothingEnabled = false;

    context.fillStyle = "#F1E9DA";
    context.fillRect(-4, -6, 108, 110);

    context.fillStyle = "#E9E0D2";
    context.fillRect(47, 8, 6, 92);

    context.strokeStyle = "rgba(125, 111, 91, 0.16)";
    context.lineWidth = 0.6 * unit;
    for (let x = -4; x <= 104; x += 5) {
      context.beginPath();
      context.moveTo(x, -6);
      context.lineTo(x, 104);
      context.stroke();
    }
    for (let y = -6; y <= 104; y += 5) {
      context.beginPath();
      context.moveTo(-4, y);
      context.lineTo(104, y);
      context.stroke();
    }

    for (const center of clusterCenters) {
      const zoneWidth = 27;
      const zoneHeight = 22;
      const zoneX = center.x - zoneWidth / 2;
      const zoneY = center.y - zoneHeight / 2;

      paintClippedZone(context, zoneX, zoneY, zoneWidth, zoneHeight, 2.2);
      context.fillStyle = hexWithAlpha(center.color, "16");
      context.fill();
      context.lineWidth = 1.2 * unit;
      context.strokeStyle = hexWithAlpha(center.color, "62");
      context.stroke();

      context.fillStyle = "#A99479";
      context.fillRect(center.x - 8, center.y - 2.4, 16, 1.5);
      context.fillRect(center.x - 8, center.y + 4.4, 16, 1.5);
      context.fillStyle = "#D8CCBA";
      context.fillRect(center.x - 7.6, center.y - 2.1, 15.2, 0.8);
      context.fillRect(center.x - 7.6, center.y + 4.7, 15.2, 0.8);

      const label = `${center.label} · ${center.count} 位`;
      context.font = `700 ${9 * unit}px ui-sans-serif, system-ui`;
      const labelWidth = context.measureText(label).width;
      const labelX = center.x - labelWidth / 2;
      const labelY = center.y < 40 ? center.y + 14.6 : center.y - 14.5;
      context.fillStyle = "#FFF9EE";
      context.fillRect(
        labelX - 4 * unit,
        labelY - 7 * unit,
        labelWidth + 8 * unit,
        14 * unit,
      );
      context.fillStyle = center.color;
      context.fillRect(labelX - 4 * unit, labelY - 7 * unit, 3 * unit, 14 * unit);
      context.fillStyle = "#27333E";
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillText(label, labelX, labelY);
    }

    if (candidateVisible && seatmateStudent) {
      const midpointX = (candidatePosition.x + seatmateStudent.layout.x) / 2;
      context.beginPath();
      context.moveTo(candidatePosition.x, candidatePosition.y);
      context.lineTo(midpointX, candidatePosition.y);
      context.lineTo(midpointX, seatmateStudent.layout.y);
      context.lineTo(seatmateStudent.layout.x, seatmateStudent.layout.y);
      context.setLineDash([3 * unit, 3 * unit]);
      context.lineWidth = 2 * unit;
      context.strokeStyle = "#D5912ACC";
      context.stroke();
      context.setLineDash([]);
    }

    context.restore();
  }

  function paintCandidateSeat(
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (!candidateVisible) return;
    context.save();
    context.translate(candidatePosition.x, candidatePosition.y);
    if (seatClaimed) {
      paintPixelSeatedUser(
        context,
        globalScale,
        seatRevealProgress,
        lifeFrame,
        reducedMotion,
      );
    } else {
      paintPixelCandidateSeat(context, globalScale, candidateRevealProgress);
    }
    context.restore();
  }

  function handleHover(node: NodeObject<GraphNode> | null) {
    if (node?.clusterId === "anchor") return;
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
        y: Math.max(148, position.y),
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
        backgroundColor="#F1E9DA"
        cooldownTicks={0}
        warmupTicks={0}
        enableNodeDrag={false}
        enablePanInteraction={false}
        enableZoomInteraction={false}
        nodeLabel={() => ""}
        nodeCanvasObject={paintStudent}
        nodePointerAreaPaint={paintPointerArea}
        onRenderFramePre={paintClassroomScene}
        onRenderFramePost={paintCandidateSeat}
        onNodeHover={handleHover}
        onNodeClick={(node) => {
          if (node.clusterId === "anchor") return;
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
