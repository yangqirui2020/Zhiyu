"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { Classroom } from "@/domain/schemas";

import styles from "./classroom.module.css";

const ForceGraphCanvas = dynamic(() => import("./ForceGraphCanvas"), {
  loading: () => (
    <div className={styles.canvasLoading}>正在摆放这间教室的座位…</div>
  ),
  ssr: false,
});

type ForceGraphAdapterProps = {
  classroom: Classroom;
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

export function ForceGraphAdapter({
  classroom,
  selectedStudentId,
  candidateVisible,
  candidatePosition,
  seatmateStudentId,
  seatClaimed,
  blackboardExpanded,
  roundtable,
  onSelectStudent,
}: ForceGraphAdapterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateSize = () => {
      const bounds = container.getBoundingClientRect();
      setSize({
        width: Math.max(320, Math.floor(bounds.width)),
        height: Math.max(420, Math.floor(bounds.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={styles.graphAdapter}>
      {size.width > 0 && size.height > 0 ? (
        <ForceGraphCanvas
          classroom={classroom}
          width={size.width}
          height={size.height}
          selectedStudentId={selectedStudentId}
          candidateVisible={candidateVisible}
          candidatePosition={candidatePosition}
          seatmateStudentId={seatmateStudentId}
          seatClaimed={seatClaimed}
          blackboardExpanded={blackboardExpanded}
          roundtable={roundtable}
          onSelectStudent={onSelectStudent}
        />
      ) : (
        <div className={styles.canvasLoading}>正在摆放这间教室的座位…</div>
      )}
    </div>
  );
}
