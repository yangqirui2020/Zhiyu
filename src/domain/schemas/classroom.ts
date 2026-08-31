import { z } from "zod";

import { provenanceSchema, schemaVersionSchema } from "./common.ts";

const stableId = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}_[a-z0-9][a-z0-9_-]*$`));

const httpsUrlSchema = z
  .url()
  .refine((value) => new URL(value).protocol === "https:", "URL must use HTTPS");

export const questionSchema = z.object({
  schemaVersion: schemaVersionSchema,
  id: stableId("q"),
  externalId: z.string().min(1).nullable(),
  title: z.string().min(1),
  url: httpsUrlSchema,
  searchQueries: z.array(z.string().min(1)),
});

export const sourceContentSchema = z.object({
  schemaVersion: schemaVersionSchema,
  id: stableId("src"),
  provider: z.literal("zhihu"),
  externalId: z.string().min(1),
  contentType: z.enum(["answer", "article", "other"]),
  questionId: stableId("q"),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  textKind: z.enum(["search_excerpt", "full_text"]),
  url: httpsUrlSchema,
  author: z.object({
    displayName: z.string().min(1),
    badge: z.string().min(1).nullable(),
    authorityLevel: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.null(),
    ]),
  }),
  metrics: z.object({
    voteUpCount: z.number().int().nonnegative().nullable(),
    commentCount: z.number().int().nonnegative().nullable(),
  }),
  capturedAt: z.iso.datetime(),
});

const sourceExcerptEvidenceSchema = z.object({
  id: stableId("ev"),
  kind: z.literal("source_excerpt"),
  text: z.string().min(1),
  sourceContentId: stableId("src"),
});

const noteExcerptEvidenceSchema = z
  .object({
    id: stableId("ev"),
    kind: z.literal("note_excerpt"),
    text: z.string().min(1),
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
  })
  .refine(({ start, end }) => end > start, {
    message: "Note evidence end must be greater than start",
    path: ["end"],
  });

export const evidenceSchema = z.discriminatedUnion("kind", [
  sourceExcerptEvidenceSchema,
  noteExcerptEvidenceSchema,
]);

export const argumentDraftSchema = z.object({
  conclusion: z.string().min(1),
  reasons: z.array(z.string().min(1)).min(1).max(3),
  evidenceIds: z.array(stableId("ev")).min(1),
  qualifiers: z.array(z.string().min(1)),
});

export const argumentSchema = argumentDraftSchema.extend({
  schemaVersion: schemaVersionSchema,
  id: stableId("arg"),
  sourceContentId: stableId("src"),
  extraction: z.object({
    promptVersion: z.string().min(1),
    modelId: z.string().min(1),
    generatedAt: z.iso.datetime(),
  }),
});

const normalizedCoordinateSchema = z.number().finite().min(0).max(100);

export const studentSchema = z.object({
  id: stableId("stu"),
  sourceContentId: stableId("src"),
  argumentId: stableId("arg"),
  assignment: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("cluster"), clusterId: stableId("clu") }),
    z.object({ kind: z.literal("independent") }),
  ]),
  displaySeed: z.number().int().nonnegative(),
  layout: z.object({
    x: normalizedCoordinateSchema,
    y: normalizedCoordinateSchema,
  }),
});

export const clusterSchema = z.object({
  id: stableId("clu"),
  label: z.string().min(1),
  labelKind: z.literal("ai_generated"),
  summary: z.string().min(1),
  commonReasons: z.array(z.string().min(1)).min(1).max(3),
  studentIds: z.array(stableId("stu")).min(1),
  representativeArgumentIds: z.array(stableId("arg")).min(1),
  limits: z.array(z.string().min(1)),
  confidence: z.enum(["high", "medium", "low"]),
  renderMode: z.enum(["clustered", "independent"]),
  layout: z.object({
    centerX: normalizedCoordinateSchema,
    centerY: normalizedCoordinateSchema,
  }),
});

export const clusterRepresentativeSchema = z.object({
  clusterId: stableId("clu"),
  title: z.string().min(1),
  commonReasons: z.array(z.string().min(1)).min(1).max(3),
  representativeSourceIds: z.array(stableId("src")).min(1),
  exampleResponses: z.array(
    z.object({
      promptKey: z.enum(["cross_cluster", "out_of_scope"]),
      text: z.string().min(1),
      evidenceIds: z.array(stableId("ev")).min(1),
    }),
  ),
  disclosure: z.string().min(1),
});

const classroomShapeSchema = z.object({
  schemaVersion: schemaVersionSchema,
  revision: z.string().min(1),
  question: questionSchema,
  provenance: provenanceSchema,
  sources: z.array(sourceContentSchema).min(1),
  evidence: z.array(evidenceSchema).min(1),
  arguments: z.array(argumentSchema).min(1),
  students: z.array(studentSchema).min(1),
  clusters: z.array(clusterSchema).min(1),
  representatives: z.array(clusterRepresentativeSchema),
});

type ClassroomShape = z.infer<typeof classroomShapeSchema>;
type RelationIssue = {
  message: string;
  path: (string | number)[];
};

function duplicateIssues<T>(
  items: T[],
  idOf: (item: T) => string,
  pathRoot: string,
): RelationIssue[] {
  const seen = new Set<string>();
  const issues: RelationIssue[] = [];

  items.forEach((item, index) => {
    const id = idOf(item);
    if (seen.has(id)) {
      issues.push({ message: `Duplicate id: ${id}`, path: [pathRoot, index, "id"] });
    }
    seen.add(id);
  });

  return issues;
}

export function validateClassroomRelations(classroom: ClassroomShape): RelationIssue[] {
  const issues = [
    ...duplicateIssues(classroom.sources, (item) => item.id, "sources"),
    ...duplicateIssues(classroom.evidence, (item) => item.id, "evidence"),
    ...duplicateIssues(classroom.arguments, (item) => item.id, "arguments"),
    ...duplicateIssues(classroom.students, (item) => item.id, "students"),
    ...duplicateIssues(classroom.clusters, (item) => item.id, "clusters"),
  ];
  const sourceById = new Map(classroom.sources.map((source) => [source.id, source]));
  const evidenceById = new Map(classroom.evidence.map((evidence) => [evidence.id, evidence]));
  const argumentById = new Map(classroom.arguments.map((argument) => [argument.id, argument]));
  const studentById = new Map(classroom.students.map((student) => [student.id, student]));
  const clusterById = new Map(classroom.clusters.map((cluster) => [cluster.id, cluster]));
  const sourceExternalKeys = new Set<string>();

  classroom.sources.forEach((source, index) => {
    const externalKey = `${source.provider}:${source.externalId}`;
    if (sourceExternalKeys.has(externalKey)) {
      issues.push({
        message: `Duplicate source identity: ${externalKey}`,
        path: ["sources", index, "externalId"],
      });
    }
    sourceExternalKeys.add(externalKey);
    if (source.questionId !== classroom.question.id) {
      issues.push({
        message: `Source ${source.id} does not belong to question ${classroom.question.id}`,
        path: ["sources", index, "questionId"],
      });
    }
  });

  classroom.evidence.forEach((evidence, index) => {
    if (evidence.kind !== "source_excerpt") return;
    const source = sourceById.get(evidence.sourceContentId);
    if (!source) {
      issues.push({
        message: `Evidence ${evidence.id} references a missing source`,
        path: ["evidence", index, "sourceContentId"],
      });
      return;
    }
    if (!source.excerpt.includes(evidence.text)) {
      issues.push({
        message: `Evidence ${evidence.id} is not a substring of its source excerpt`,
        path: ["evidence", index, "text"],
      });
    }
  });

  classroom.arguments.forEach((argument, argumentIndex) => {
    if (!sourceById.has(argument.sourceContentId)) {
      issues.push({
        message: `Argument ${argument.id} references a missing source`,
        path: ["arguments", argumentIndex, "sourceContentId"],
      });
    }
    argument.evidenceIds.forEach((evidenceId, evidenceIndex) => {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence) {
        issues.push({
          message: `Argument ${argument.id} references missing evidence ${evidenceId}`,
          path: ["arguments", argumentIndex, "evidenceIds", evidenceIndex],
        });
      } else if (
        evidence.kind !== "source_excerpt" ||
        evidence.sourceContentId !== argument.sourceContentId
      ) {
        issues.push({
          message: `Argument ${argument.id} references evidence from another source`,
          path: ["arguments", argumentIndex, "evidenceIds", evidenceIndex],
        });
      }
    });
  });

  const studentSourceIds = new Set<string>();
  const studentArgumentIds = new Set<string>();
  classroom.students.forEach((student, studentIndex) => {
    const source = sourceById.get(student.sourceContentId);
    const argument = argumentById.get(student.argumentId);
    if (!source) {
      issues.push({
        message: `Student ${student.id} references a missing source`,
        path: ["students", studentIndex, "sourceContentId"],
      });
    }
    if (!argument) {
      issues.push({
        message: `Student ${student.id} references a missing argument`,
        path: ["students", studentIndex, "argumentId"],
      });
    } else if (argument.sourceContentId !== student.sourceContentId) {
      issues.push({
        message: `Student ${student.id} source and argument source do not match`,
        path: ["students", studentIndex, "argumentId"],
      });
    }
    if (studentSourceIds.has(student.sourceContentId)) {
      issues.push({
        message: `Source ${student.sourceContentId} is assigned to more than one student`,
        path: ["students", studentIndex, "sourceContentId"],
      });
    }
    if (studentArgumentIds.has(student.argumentId)) {
      issues.push({
        message: `Argument ${student.argumentId} is assigned to more than one student`,
        path: ["students", studentIndex, "argumentId"],
      });
    }
    studentSourceIds.add(student.sourceContentId);
    studentArgumentIds.add(student.argumentId);

    if (student.assignment.kind === "cluster") {
      const cluster = clusterById.get(student.assignment.clusterId);
      if (!cluster) {
        issues.push({
          message: `Student ${student.id} references a missing cluster`,
          path: ["students", studentIndex, "assignment", "clusterId"],
        });
      } else if (!cluster.studentIds.includes(student.id)) {
        issues.push({
          message: `Student ${student.id} is absent from its cluster studentIds`,
          path: ["students", studentIndex, "assignment", "clusterId"],
        });
      }
    }
  });

  if (
    studentSourceIds.size !== sourceById.size ||
    classroom.sources.some((source) => !studentSourceIds.has(source.id))
  ) {
    issues.push({
      message: "Students and sources must form a one-to-one complete mapping",
      path: ["students"],
    });
  }
  if (
    studentArgumentIds.size !== argumentById.size ||
    classroom.arguments.some((argument) => !studentArgumentIds.has(argument.id))
  ) {
    issues.push({
      message: "Students and arguments must form a one-to-one complete mapping",
      path: ["students"],
    });
  }

  const clusteredStudentIds = new Set<string>();
  classroom.clusters.forEach((cluster, clusterIndex) => {
    cluster.studentIds.forEach((studentId, studentIndex) => {
      const student = studentById.get(studentId);
      if (!student) {
        issues.push({
          message: `Cluster ${cluster.id} references missing student ${studentId}`,
          path: ["clusters", clusterIndex, "studentIds", studentIndex],
        });
      } else if (
        student.assignment.kind !== "cluster" ||
        student.assignment.clusterId !== cluster.id
      ) {
        issues.push({
          message: `Cluster ${cluster.id} contains a student assigned elsewhere`,
          path: ["clusters", clusterIndex, "studentIds", studentIndex],
        });
      }
      if (clusteredStudentIds.has(studentId)) {
        issues.push({
          message: `Student ${studentId} appears in more than one cluster`,
          path: ["clusters", clusterIndex, "studentIds", studentIndex],
        });
      }
      clusteredStudentIds.add(studentId);
    });

    const clusterArgumentIds = new Set(
      cluster.studentIds
        .map((studentId) => studentById.get(studentId)?.argumentId)
        .filter((id): id is string => Boolean(id)),
    );
    cluster.representativeArgumentIds.forEach((argumentId, argumentIndex) => {
      if (!argumentById.has(argumentId) || !clusterArgumentIds.has(argumentId)) {
        issues.push({
          message: `Cluster ${cluster.id} representative argument is outside the cluster`,
          path: ["clusters", clusterIndex, "representativeArgumentIds", argumentIndex],
        });
      }
    });
  });

  const representativeClusterIds = new Set<string>();
  classroom.representatives.forEach((representative, representativeIndex) => {
    const cluster = clusterById.get(representative.clusterId);
    if (!cluster) {
      issues.push({
        message: `Representative references missing cluster ${representative.clusterId}`,
        path: ["representatives", representativeIndex, "clusterId"],
      });
      return;
    }
    if (representativeClusterIds.has(representative.clusterId)) {
      issues.push({
        message: `Cluster ${representative.clusterId} has duplicate representatives`,
        path: ["representatives", representativeIndex, "clusterId"],
      });
    }
    representativeClusterIds.add(representative.clusterId);

    const clusterSourceIds = new Set(
      cluster.studentIds
        .map((studentId) => studentById.get(studentId)?.sourceContentId)
        .filter((id): id is string => Boolean(id)),
    );
    representative.representativeSourceIds.forEach((sourceId, sourceIndex) => {
      if (!sourceById.has(sourceId) || !clusterSourceIds.has(sourceId)) {
        issues.push({
          message: `Representative source ${sourceId} is outside its cluster`,
          path: ["representatives", representativeIndex, "representativeSourceIds", sourceIndex],
        });
      }
    });
    representative.exampleResponses.forEach((response, responseIndex) => {
      response.evidenceIds.forEach((evidenceId, evidenceIndex) => {
        if (!evidenceById.has(evidenceId)) {
          issues.push({
            message: `Representative response references missing evidence ${evidenceId}`,
            path: [
              "representatives",
              representativeIndex,
              "exampleResponses",
              responseIndex,
              "evidenceIds",
              evidenceIndex,
            ],
          });
        }
      });
    });
  });

  return issues;
}

export const classroomSchema = classroomShapeSchema.superRefine((classroom, context) => {
  for (const issue of validateClassroomRelations(classroom)) {
    context.addIssue({ code: "custom", ...issue });
  }
});

export type Question = z.infer<typeof questionSchema>;
export type SourceContent = z.infer<typeof sourceContentSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type ArgumentDraft = z.infer<typeof argumentDraftSchema>;
export type Argument = z.infer<typeof argumentSchema>;
export type Student = z.infer<typeof studentSchema>;
export type Cluster = z.infer<typeof clusterSchema>;
export type ClusterRepresentative = z.infer<typeof clusterRepresentativeSchema>;
export type Classroom = z.infer<typeof classroomSchema>;
