import type { Classroom } from "../../domain/schemas/classroom.ts";

/** Screen layout only: source count, group membership and immutable snapshot stay intact. */
export function classroomPresentation(classroom: Classroom, width: number, height: number, expanded: boolean) {
  const mobile = width < 500;
  const top = mobile ? (expanded ? 264 : 154) : (expanded ? 190 : 140);
  const bottom = height - (mobile ? 86 : 105);
  const columns = mobile && classroom.clusters.length === 2 ? 1 : 2;
  const rows = Math.ceil(classroom.clusters.length / columns);
  const gap = mobile ? 12 : 28;
  const side = mobile ? 16 : 40;
  const cellWidth = (width - side * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (bottom - top - gap * (rows - 1)) / rows;
  const people = new Map<string, { x: number; y: number }>();
  const groups = classroom.clusters.map((cluster, groupIndex) => {
    const x = side + (groupIndex % columns) * (cellWidth + gap) + cellWidth / 2;
    const y = top + Math.floor(groupIndex / columns) * (cellHeight + gap) + cellHeight / 2;
    const count = cluster.studentIds.length;
    const seatsPerRow = mobile && columns === 2 ? 2 : count <= 3 ? count : 3;
    const seatRows = Math.ceil(count / seatsPerRow);
    const usableHeight = Math.min(cellHeight - 58, mobile ? 138 : count > 6 ? 270 : 204);
    const spacingX = Math.min((cellWidth - 42) / seatsPerRow, mobile ? 67 : 98);
    const spacingY = Math.min(usableHeight / seatRows, mobile ? 56 : 84);
    const groupHeight = seatRows * spacingY + 48;
    const groupWidth = Math.min(cellWidth, seatsPerRow * spacingX + 32);
    cluster.studentIds.forEach((id, index) => {
      const row = Math.floor(index / seatsPerRow);
      const inRow = Math.min(seatsPerRow, count - row * seatsPerRow);
      people.set(id, { x: x + ((index % seatsPerRow) - (inRow - 1) / 2) * spacingX, y: y + (row - (seatRows - 1) / 2) * spacingY + 8 });
    });
    return { ...cluster, x, y, width: groupWidth, height: groupHeight, rows: seatRows, spacingY };
  });
  // Independent sources also have a DOM and spatial position; never hide them.
  const independents = classroom.students.filter(s => s.assignment.kind === "independent");
  independents.forEach((student, index) => people.set(student.id, { x: side + 36 + index * 52, y: bottom - 24 }));
  const baseScale = mobile ? (columns === 1 ? 1.18 : 1.04) : classroom.students.length <= 12 ? 1.9 : 1.48;
  const characterScale = Math.min(baseScale, Math.min(...groups.filter(group => group.rows > 1).map(group => group.spacingY)) / 42);
  return { people, groups, candidate: { x: mobile ? width - 111 : width / 2, y: bottom + 39 }, characterScale };
}
