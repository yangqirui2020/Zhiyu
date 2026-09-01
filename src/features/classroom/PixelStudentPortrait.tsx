import type { CSSProperties } from "react";

import styles from "./classroom.module.css";

type PixelStudentPortraitProps = {
  seed: number;
  color: string;
  role?: "student" | "seatmate" | "candidate";
  label?: string;
};

type PortraitStyle = CSSProperties & {
  "--portrait-shirt": string;
  "--portrait-skin": string;
  "--portrait-hair": string;
};

const SKIN_TONES = ["#F0C5A8", "#DFAE8D", "#C88E6D", "#A96F51"] as const;
const HAIR_TONES = ["#2D2927", "#49372F", "#6B4B35", "#263642"] as const;

export const PIXEL_CLUSTER_COLORS = [
  "#637F96",
  "#5E8B83",
  "#8075A1",
  "#9A7C58",
  "#9B6F78",
] as const;

export function PixelStudentPortrait({
  seed,
  color,
  role = "student",
  label,
}: PixelStudentPortraitProps) {
  const style: PortraitStyle = {
    "--portrait-shirt": color,
    "--portrait-skin": SKIN_TONES[seed % SKIN_TONES.length],
    "--portrait-hair": HAIR_TONES[(seed * 3) % HAIR_TONES.length],
  };
  const roleClass =
    role === "student" ? "" : styles[`portraitRole${role}`];

  return (
    <span
      className={[styles.pixelPortrait, styles[`portraitHair${seed % 4}`], roleClass]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      <i className={styles.portraitChair} />
      <i className={styles.portraitBody} />
      <i className={styles.portraitHead} />
      <i className={styles.portraitHair} />
      <i className={styles.portraitEyes} />
      <i className={styles.portraitDesk} />
      <i className={styles.portraitBook} />
      {role === "seatmate" ? <b>同桌</b> : null}
    </span>
  );
}
