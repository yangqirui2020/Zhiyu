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
};

type ForceGraphCanvasProps = {
  classroom: Classroom;
  width: number;
  height: number;
  selectedStudentId: string | null;
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
  onSelectStudent,
}: ForceGraphCanvasProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode> | undefined>(undefined);
  const fitPadding = width < 500 ? 8 : 52;
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(
    null,
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    graphRef.current?.zoomToFit(0, fitPadding);
  }, [fitPadding, height, width]);

  function paintStudent(
    node: NodeObject<GraphNode>,
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    if (typeof node.x !== "number" || typeof node.y !== "number") {
      return;
    }

    const visualRadius = 13 / globalScale;
    const isSelected = node.studentId === selectedStudentId;
    const isHovered = node.studentId === hoveredStudentId;
    const isMuted = Boolean(selectedStudentId && !isSelected);

    context.save();
    context.globalAlpha = isMuted ? 0.42 : 1;
    context.translate(node.x, node.y);

    context.beginPath();
    context.arc(0, 0, visualRadius, 0, Math.PI * 2);
    context.fillStyle = isSelected ? "#FFFCF6" : node.color;
    context.fill();
    context.lineWidth = (isSelected ? 3 : isHovered ? 2.25 : 1.25) / globalScale;
    context.strokeStyle = isSelected || isHovered ? "#19232E" : "#FFFCF6";
    context.stroke();

    context.beginPath();
    context.moveTo(-visualRadius * 0.58, visualRadius * 0.48);
    context.lineTo(visualRadius * 0.58, visualRadius * 0.48);
    context.strokeStyle = isSelected ? node.color : "#FFFCF6";
    context.lineWidth = 1.2 / globalScale;
    context.stroke();

    context.fillStyle = isSelected ? "#19232E" : "#FFFCF6";
    context.font = `600 ${9 / globalScale}px ui-sans-serif, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(node.seatNumber, 0, -0.5 / globalScale);
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
    context.arc(node.x, node.y, 22 / globalScale, 0, Math.PI * 2);
    context.fill();
  }

  function paintClusterZones(
    context: CanvasRenderingContext2D,
    globalScale: number,
  ) {
    for (const center of clusterCenters) {
      context.beginPath();
      context.arc(center.x, center.y, 14, 0, Math.PI * 2);
      context.fillStyle = hexWithAlpha(center.color, "12");
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
      const labelY = center.y - 18;
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
