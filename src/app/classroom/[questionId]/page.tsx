import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClassroomExperience } from "@/features/classroom";
import { loadClassroom } from "@/server/use-cases/load-classroom";
import { loadDemoNarrative } from "@/server/use-cases/load-demo-narrative";
import { classroomCatalog, findClassroom } from "../../../../data/classrooms/catalog";

type ClassroomPageProps = {
  params: Promise<{ questionId: string }>;
};

export async function generateMetadata({ params }: ClassroomPageProps): Promise<Metadata> {
  const entry = findClassroom((await params).questionId);
  return { title: entry ? `${entry.title} · 知遇一席` : "教室未找到 · 知遇一席", description: entry?.subtitle };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return classroomCatalog.map(({ questionId }) => ({ questionId }));
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { questionId } = await params;
  const controller = new AbortController();
  const [classroom, demoScenario] = await Promise.all([
    loadClassroom(questionId, {
      requestId: `page_${questionId}`,
      signal: controller.signal,
      deadlineAt: Number.POSITIVE_INFINITY,
      mode: "snapshot",
    }).catch(() => null),
    loadDemoNarrative(questionId),
  ]);

  if (!classroom || !demoScenario) {
    notFound();
  }

  return (
    <ClassroomExperience
      key={`${classroom.question.id}:${classroom.revision}`}
      classroom={classroom}
      demoScenario={demoScenario}
    />
  );
}
