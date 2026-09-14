import { z } from "zod";
import { learningCompletionDraftSchema, seatmateDraftSchema } from "./learning.ts";
import type { Classroom } from "./classroom.ts";

const text = z.string().min(1).max(600);
export const classroomNarrativeSchema = z.object({
  id: z.string().min(1), disclosure: text,
  campus: z.object({ building: text, floor: text, rooms: z.array(z.object({ number: z.string().min(1), title: text, status: z.enum(["current", "next", "preview"]), note: text })).min(1).max(3) }),
  noteText: z.string().min(50).max(8000), claimTitle: text,
  candidate: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100), title: text, positionRationale: text, evidence: z.array(z.object({ label: text, explanation: text })).max(3), coverageDisclosure: text }),
  roundtable: z.object({ speakers: z.array(z.object({ clusterId: z.string(), studentId: z.string(), line: text, evidenceIds: z.array(z.string()).min(1) })).min(2).max(8), facilitation: text }),
  blackboard: z.object({ consensus: text, controversy: text, openQuestion: text }),
  seatmate: seatmateDraftSchema,
  classNote: learningCompletionDraftSchema.shape.classNote,
  mySeat: learningCompletionDraftSchema.shape.mySeat,
  zhihuDraft: learningCompletionDraftSchema.shape.zhihuDraft,
  nextClassroom: z.object({ number: z.string(), title: text, causalNote: text, statusNote: text }),
  evidenceIds: z.array(z.string()).min(1),
});
export type ClassroomNarrative = z.infer<typeof classroomNarrativeSchema>;

export function validateNarrativeReferences(narrative: ClassroomNarrative, classroom: Classroom): string[] {
  const issues: string[] = [];
  const evidence = new Map(classroom.evidence.map((e) => [e.id, e]));
  for (const id of narrative.evidenceIds) if (!evidence.has(id)) issues.push("Narrative evidence outside classroom");
  for (const speaker of narrative.roundtable.speakers) {
    const cluster = classroom.clusters.find((c) => c.id === speaker.clusterId);
    const student = classroom.students.find((s) => s.id === speaker.studentId);
    if (!cluster || !student || !cluster.studentIds.includes(student.id)) issues.push("Roundtable speaker outside cluster");
    for (const id of speaker.evidenceIds) {
      const item = evidence.get(id);
      if (!item || item.kind !== "source_excerpt" || item.sourceContentId !== student?.sourceContentId) issues.push("Roundtable evidence does not belong to speaker");
    }
  }
  if (!classroom.students.some((s) => s.id === narrative.seatmate.studentId)) issues.push("Narrative seatmate outside classroom");
  return issues;
}
