import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { mockClassroomFixture } from "../../../../data/fixtures/classrooms/learn-programming.ts";
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

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ questionId: classroom.question.id }];
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { questionId } = await params;

  if (questionId !== classroom.question.id) {
    notFound();
  }

  return <ClassroomExperience classroom={classroom} />;
}
