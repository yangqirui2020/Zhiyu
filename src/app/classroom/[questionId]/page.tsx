import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mockClassroomFixture } from "../../../../data/fixtures/classrooms/learn-programming.ts";
import { learnProgrammingDemoV3Scenario } from "../../../../data/fixtures/scenarios/learn-programming-demo-v3.ts";
import { classroomSchema } from "@/domain/schemas";
import { ClassroomExperience } from "@/features/classroom";

type ClassroomPageProps = {
  params: Promise<{ questionId: string }>;
};

export const metadata: Metadata = {
  title: "编程第一门语言 · 知遇一席",
  description: "走进一间由不同学习路径观点组成的演示教室。",
};

const classroom = classroomSchema.parse(mockClassroomFixture);

if (
  !classroom.students.some(
    (student) => student.id === learnProgrammingDemoV3Scenario.seatmate.studentId,
  )
) {
  throw new Error("Demo V3 scenario references a missing Seatmate Student.");
}

for (const speaker of learnProgrammingDemoV3Scenario.roundtable.speakers) {
  if (!classroom.students.some((student) => student.id === speaker.studentId)) {
    throw new Error("Demo V3 roundtable references a missing speaker Student.");
  }
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ questionId: classroom.question.id }];
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { questionId } = await params;

  if (questionId !== classroom.question.id) {
    notFound();
  }

  return (
    <ClassroomExperience
      classroom={classroom}
      demoScenario={learnProgrammingDemoV3Scenario}
    />
  );
}
