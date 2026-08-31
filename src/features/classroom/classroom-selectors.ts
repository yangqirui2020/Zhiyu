import type { Classroom } from "@/domain/schemas";

export type ClassroomStudent = Classroom["students"][number];
export type ClassroomCluster = Classroom["clusters"][number];

export function getStudentDetails(
  classroom: Classroom,
  studentId: string,
) {
  const student = classroom.students.find((item) => item.id === studentId);

  if (!student) {
    return null;
  }

  const source = classroom.sources.find(
    (item) => item.id === student.sourceContentId,
  );
  const argument = classroom.arguments.find(
    (item) => item.id === student.argumentId,
  );
  const clusterId =
    student.assignment.kind === "cluster"
      ? student.assignment.clusterId
      : null;
  const cluster = clusterId
    ? classroom.clusters.find((item) => item.id === clusterId)
    : null;

  if (!source || !argument) {
    return null;
  }

  const evidence = argument.evidenceIds.flatMap((evidenceId) => {
    const item = classroom.evidence.find(
      (candidate) => candidate.id === evidenceId,
    );

    if (
      !item ||
      item.kind !== "source_excerpt" ||
      item.sourceContentId !== source.id
    ) {
      return [];
    }

    return [item];
  });

  return { student, source, argument, cluster, evidence };
}

export type StudentDetails = NonNullable<
  ReturnType<typeof getStudentDetails>
>;

export function studentSeatNumber(
  classroom: Classroom,
  studentId: string,
) {
  const index = classroom.students.findIndex((item) => item.id === studentId);
  return index < 0 ? "--" : String(index + 1).padStart(2, "0");
}
