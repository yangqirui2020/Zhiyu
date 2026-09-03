import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClassroomExperience } from "@/features/classroom";
import { loadClassroom } from "@/server/use-cases/load-classroom";
import { loadDemoNarrative } from "@/server/use-cases/load-demo-narrative";

type ClassroomPageProps = {
  params: Promise<{ questionId: string }>;
};

export const metadata: Metadata = {
  title: "编程第一门语言 · 知遇一席",
  description: "走进一间由不同学习路径观点组成的演示教室。",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ questionId: "q_learn_programming" }];
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { questionId } = await params;
  const controller = new AbortController();
  const [classroom, demoScenario] = await Promise.all([
    loadClassroom(questionId, {
      requestId: `page_${questionId}`,
      signal: controller.signal,
      deadlineAt: Number.POSITIVE_INFINITY,
      mode: "mock",
    }).catch(() => null),
    loadDemoNarrative(questionId),
  ]);

  if (!classroom || !demoScenario) {
    notFound();
  }

  return (
    <ClassroomExperience
      classroom={classroom}
      demoScenario={demoScenario}
    />
  );
}
