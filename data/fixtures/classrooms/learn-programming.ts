import {
  classroomSchema,
  type Classroom,
} from "../../../src/domain/schemas/index.ts";

const schemaVersion = "1.0.0-rc.1" as const;
const generatedAt = "2026-08-30T10:00:00.000Z";
const pointOffsets = [
  [-7, -4],
  [-3, -7],
  [2, -6],
  [7, -3],
  [-7, 3],
  [-2, 7],
  [3, 6],
  [7, 2],
] as const;

const clusterSeeds = [
  {
    id: "clu_c_foundations",
    label: "C 语言基础路径",
    summary: "先用较少的语言抽象接触类型、内存与编译过程，再迁移到其他语言。",
    commonReasons: ["底层反馈能帮助形成计算机运行模型", "受限的工具会迫使初学者理解基本概念"],
    limits: ["较陡的反馈曲线可能让完全没有经验的学习者过早受挫"],
    centerX: 18,
    centerY: 30,
    conclusions: [
      "先学 C 能更早理解变量与内存之间的关系。",
      "C 的编译反馈适合建立程序从源码到执行的基本模型。",
      "指针虽然困难，却能让数据结构不再只是抽象名词。",
      "从 C 起步便于之后理解操作系统和嵌入式开发。",
      "较少的语言魔法让初学者能看见程序的真实成本。",
      "手动处理边界问题能培养更谨慎的调试习惯。",
      "C 适合作为计算机专业课程之间的共同底座。",
      "先掌握 C 的核心子集，再转向高级语言会更稳妥。",
    ],
  },
  {
    id: "clu_python_momentum",
    label: "Python 快速反馈路径",
    summary: "先用低门槛语法完成可运行作品，以持续反馈建立兴趣和编程直觉。",
    commonReasons: ["更短的反馈周期有利于维持学习动机", "丰富的标准库让初学者更快连接真实问题"],
    limits: ["如果长期回避类型、复杂度和运行机制，基础理解可能出现缺口"],
    centerX: 50,
    centerY: 22,
    conclusions: [
      "Python 能让初学者在第一周就完成有用的小程序。",
      "简洁语法减少了非核心错误对学习注意力的干扰。",
      "交互式运行环境适合通过实验形成编程直觉。",
      "用 Python 处理文件和数据能快速连接真实学习任务。",
      "先获得作品反馈，比先记住大量语法规则更能维持动力。",
      "丰富的教学资源使 Python 更适合自学者排查常见问题。",
      "Python 可以先承载算法思维，再补充底层实现细节。",
      "对于非计算机专业，Python 更容易形成可迁移的工具能力。",
    ],
  },
  {
    id: "clu_project_first",
    label: "项目牵引路径",
    summary: "语言选择服从第一个具体项目，让真实目标决定需要补齐的知识。",
    commonReasons: ["具体产出能为抽象概念提供上下文", "围绕项目遇到的问题学习更容易形成记忆"],
    limits: ["项目范围失控时容易形成只会拼接、难以解释的知识碎片"],
    centerX: 82,
    centerY: 31,
    conclusions: [
      "第一门语言应由想完成的第一个项目决定。",
      "做网页、数据分析或硬件时，合适的起点本来就不同。",
      "先确定可在两周完成的作品，再选择最短技术路径。",
      "项目中的真实报错会暴露最需要学习的概念。",
      "围绕一个可展示成果迭代，比线性读完教材更有效。",
      "语言争论应让位于问题拆解和持续交付能力。",
      "同伴反馈和真实用户能让练习项目产生更清晰的标准。",
      "项目驱动仍需要定期回补基础，而不是永久跳过原理。",
    ],
  },
  {
    id: "clu_concepts_first",
    label: "概念优先路径",
    summary: "先学习控制流、数据建模、分解与测试等通用概念，再选择语言承载练习。",
    commonReasons: ["通用概念比具体语法更能跨语言迁移", "先理解问题模型可以降低对工具的依赖"],
    limits: ["脱离可运行代码的概念课程容易变得抽象和缺少反馈"],
    centerX: 31,
    centerY: 71,
    conclusions: [
      "初学阶段最重要的是控制流与数据结构，而不是语言阵营。",
      "先学会把问题分成函数，比记忆语法细节更可迁移。",
      "测试和调试方法应从第一门课开始出现。",
      "用伪代码澄清步骤后，再用任意语言实现更容易发现思路错误。",
      "复杂度意识应和循环、集合等基础概念一起建立。",
      "阅读他人代码是连接抽象概念与工程表达的重要练习。",
      "同一算法用两种语言实现，可以区分概念与语法。",
      "课程评价应关注解释能力和问题分解，而不只看程序能否运行。",
    ],
  },
  {
    id: "clu_adaptive_path",
    label: "因人调整路径",
    summary: "根据学习目标、已有经验和可获得的支持，选择不同起点并设置转换节点。",
    commonReasons: ["学习目标会改变可接受的起步成本", "支持环境和先验知识会显著影响语言难度"],
    limits: ["过度个性化可能让学习路线频繁切换、缺少持续积累"],
    centerX: 70,
    centerY: 70,
    conclusions: [
      "没有脱离学习目标的统一最佳入门语言。",
      "计算机专业和把编程当工具的人可以选择不同起点。",
      "有教师陪伴时可以更早接触 C，自学时则可优先降低反馈门槛。",
      "数学和英语基础会改变不同教材的实际难度。",
      "应在完成一个阶段目标后再决定是否切换语言。",
      "每条路线都需要明确何时补足被暂时跳过的基础。",
      "学习者的挫折耐受度也是路线设计的一部分。",
      "先做短期试学再选择主路线，比依据流行度决定更可靠。",
    ],
  },
] as const;

const sources: Classroom["sources"] = [];
const evidence: Classroom["evidence"] = [];
const argumentsList: Classroom["arguments"] = [];
const students: Classroom["students"] = [];

clusterSeeds.forEach((cluster, clusterIndex) => {
  cluster.conclusions.forEach((conclusion, studentOffset) => {
    const ordinal = clusterIndex * 8 + studentOffset + 1;
    const suffix = String(ordinal).padStart(2, "0");
    const sourceId = `src_mock_${suffix}`;
    const evidenceId = `ev_mock_${suffix}`;
    const argumentId = `arg_mock_${suffix}`;
    const studentId = `stu_mock_${suffix}`;
    const [offsetX, offsetY] = pointOffsets[studentOffset];

    sources.push({
      schemaVersion,
      id: sourceId,
      provider: "zhihu",
      externalId: `mock_answer_${suffix}`,
      contentType: "answer",
      questionId: "q_learn_programming",
      title: `演示来源 ${suffix}（人工构造，非真实知乎内容）`,
      excerpt: `演示摘要片段：${conclusion} 这段文字仅用于验证观点教室的交互与信息层级。`,
      textKind: "search_excerpt",
      url: "https://www.zhihu.com/",
      author: {
        displayName: `演示来源 ${suffix}`,
        badge: null,
        authorityLevel: null,
      },
      metrics: { voteUpCount: null, commentCount: null },
      capturedAt: generatedAt,
    });
    evidence.push({
      id: evidenceId,
      kind: "source_excerpt",
      text: conclusion,
      sourceContentId: sourceId,
    });
    argumentsList.push({
      schemaVersion,
      id: argumentId,
      sourceContentId: sourceId,
      conclusion,
      reasons: [
        cluster.commonReasons[studentOffset % cluster.commonReasons.length],
        `这一演示观点从学习阶段 ${studentOffset + 1} 的具体取舍出发。`,
      ],
      evidenceIds: [evidenceId],
      qualifiers: ["仅代表人工构造的演示视角，不表示正确性、支持率或知乎立场"],
      extraction: {
        promptVersion: "fixture-manual-v1",
        modelId: "none-manual-fixture",
        generatedAt,
      },
    });
    students.push({
      id: studentId,
      sourceContentId: sourceId,
      argumentId,
      assignment: { kind: "cluster", clusterId: cluster.id },
      displaySeed: ordinal,
      layout: {
        x: cluster.centerX + offsetX,
        y: cluster.centerY + offsetY,
      },
    });
  });
});

const clusters: Classroom["clusters"] = clusterSeeds.map((cluster, clusterIndex) => {
  const firstOrdinal = clusterIndex * 8 + 1;
  const studentIds = Array.from({ length: 8 }, (_, offset) =>
    `stu_mock_${String(firstOrdinal + offset).padStart(2, "0")}`,
  );

  return {
    id: cluster.id,
    label: cluster.label,
    labelKind: "ai_generated",
    summary: cluster.summary,
    commonReasons: [...cluster.commonReasons],
    studentIds,
    representativeArgumentIds: studentIds.slice(0, 2).map((studentId) =>
      studentId.replace("stu_", "arg_"),
    ),
    limits: [...cluster.limits],
    confidence: "medium",
    renderMode: "clustered",
    layout: { centerX: cluster.centerX, centerY: cluster.centerY },
  };
});

const rawMockClassroom = {
  schemaVersion,
  revision: "mock-classroom-v1",
  question: {
    schemaVersion,
    id: "q_learn_programming",
    externalId: null,
    title: "初学编程应该先学 C 语言还是 Python？",
    url: "https://www.zhihu.com/",
    searchQueries: [],
  },
  provenance: {
    schemaVersion,
    mode: "mock",
    requestId: "req_mock_classroom_v1",
    servedAt: generatedAt,
    warnings: ["人工构造的演示数据，仅用于验证教室体验，不代表真实知乎样本。"],
  },
  sources,
  evidence,
  arguments: argumentsList,
  students,
  clusters,
  representatives: [],
};

export const mockClassroomFixture = classroomSchema.parse(rawMockClassroom);
