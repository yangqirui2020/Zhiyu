/**
 * Demo V3 Scenario —— 完整学习闭环的确定性 Fixture。
 *
 * 覆盖 V3 Golden Path：课代表圆桌 → 黑板三项 → 用户表达 → Candidate Seat →
 * 同桌追问 → 用户回应 → 课堂笔记 → 《我的一席》→ 入席 → 双出口。
 *
 * 所有文本均为预生成 Mock；未来真实 API 可逐字段替换，Demo UI 不需要重写。
 * 红线：不出现「全新观点 / 知识空白 / 新颖度 / 掌握证明 / 支持率 / 正确性」。
 */

export type DemoScenarioV3 = {
  id: string;
  disclosure: string;
  campus: {
    building: string;
    floor: string;
    rooms: Array<{
      number: string;
      title: string;
      status: "current" | "next" | "preview";
      note: string;
    }>;
  };
  /** 用户初始观点（Golden Note，exact-sample guard 沿用） */
  noteText: string;
  claimTitle: string;
  candidate: {
    x: number;
    y: number;
    title: string;
    /** 空位出现时的位置解释（为什么你坐在这里） */
    positionRationale: string;
    evidence: Array<{ label: string; explanation: string }>;
    coverageDisclosure: string;
  };
  /** 课代表圆桌：一轮可控、结构化、预生成的跨组碰撞 */
  roundtable: {
    speakers: Array<{
      clusterId: string;
      studentId: string;
      line: string;
    }>;
    facilitation: string;
  };
  /** 黑板三项：圆桌的集体认知产出 */
  blackboard: {
    consensus: string;
    controversy: string;
    openQuestion: string;
  };
  seatmate: {
    studentId: string;
    rationale: string;
    commonGround: string;
    difference: string;
    /** 同桌追问：针对用户观点漏洞的一次认知摩擦 */
    challenge: string;
    /** 演示答案：一键填充的 Golden 回应 */
    sampleAnswer: string;
  };
  /** 课堂笔记：记录「我的认知发生了什么变化」（个人认知，非全班 Summary） */
  classNote: {
    before: string;
    heard: string[];
    changed: string;
    after: string;
    /** after 中相对 before 的新增判断，用于 Cognition Diff 高亮 */
    afterHighlights: string[];
  };
  /** 《我的一席》：课堂笔记沉淀出的个人观点 */
  mySeat: {
    viewpoint: string;
    reasons: string;
    addedCondition: string;
    delta: string;
  };
  /** 知识生产出口：知乎回答提纲（Mock，可复制） */
  zhihuDraft: {
    title: string;
    outline: Array<{ label: string; text: string }>;
    note: string;
  };
  /** 学习探索出口：由本班「尚未解决的问题」生长出的下一间教室 */
  nextClassroom: {
    number: string;
    title: string;
    causalNote: string;
    statusNote: string;
  };
};

export const learnProgrammingDemoV3Scenario: DemoScenarioV3 = {
  id: "scenario_learn_programming_v3",
  disclosure: "Demo V3 · Mock 场景",
  campus: {
    building: "认知校园 · 新手路径楼",
    floor: "1F",
    rooms: [
      {
        number: "101",
        title: "初学编程应该先 C 还是 Python？",
        status: "current",
        note: "本班",
      },
      {
        number: "102",
        title: "学 Python 到什么程度，应该开始补系统基础？",
        status: "next",
        note: "由本班未解决问题生长",
      },
      {
        number: "103",
        title: "项目和刷题应该怎样安排？",
        status: "preview",
        note: "走廊预告",
      },
    ],
  },
  noteText:
    "初学编程应该先学 Python，因为反馈更快、更容易建立正反馈；先用两周做一个足够小的真实项目，记录反馈速度、挫折点和求助成本，再决定继续 Python、转向 C，或补一门更贴近目标的语言。关键不是追随流行度，而是把试学当成一次可复盘的实验。",
  claimTitle: "用带退出条件的短周期试学实验决定第一门语言，而不是一次性押注",
  candidate: {
    x: 58,
    y: 83,
    title: "这里可能有你的一席",
    positionRationale:
      "你和 Python 快反馈组一样重视早期正反馈，但你同时认为学习路线应该分阶段调整。所以你的座位位于 Python 快速反馈 × 因人调整 附近。",
    evidence: [
      {
        label: "与问题相关",
        explanation: "直接回应“第一门语言如何选择”，并给出可执行的决策方法。",
      },
      {
        label: "来自你的笔记",
        explanation: "示例观点明确写出“先 Python 建立反馈、两周试学、再决定路线”。",
      },
      {
        label: "当前覆盖较少",
        explanation: "当前演示样本提到因人调整，但很少把选择过程设计成可复盘实验。",
      },
    ],
    coverageDisclosure: "基于当前 40 条 Mock 来源、5 个观点簇的演示对比",
  },
  roundtable: {
    speakers: [
      {
        clusterId: "clu_python_momentum",
        studentId: "stu_mock_09",
        line: "第一周就能做出能跑的小程序——正反馈是新手坚持下来的燃料，先别让编译器和指针把人劝退。",
      },
      {
        clusterId: "clu_c_foundations",
        studentId: "stu_mock_01",
        line: "但如果一直回避内存和类型，“会写”和“懂原理”的差距会越拉越大，欠债迟早要还。",
      },
      {
        clusterId: "clu_project_first",
        studentId: "stu_mock_17",
        line: "其实先定下来想做什么项目，很多语言争论就自然消失了——目标不同，起点本来就不同。",
      },
      {
        clusterId: "clu_concepts_first",
        studentId: "stu_mock_25",
        line: "控制流、分解、测试这些概念是语言无关的；先学哪个载体，没有大家想的那么关键。",
      },
      {
        clusterId: "clu_adaptive_path",
        studentId: "stu_mock_33",
        line: "所以问题不该是“C 还是 Python”，而是“这个阶段的你需要哪种反馈”——并且要提前想好什么时候换。",
      },
    ],
    facilitation: "五位课代表正在把各组观点摆到同一张桌子上",
  },
  blackboard: {
    consensus: "第一门语言并不会决定长期上限。",
    controversy: "初期反馈速度和底层理解，哪个应该优先？",
    openQuestion: "什么时候应该从高层语言切换到底层？",
  },
  seatmate: {
    studentId: "stu_mock_40",
    rationale:
      "你们都认为不应执着于唯一最佳语言，但他更强调“学习路径必须设置明确的切换条件”。",
    commonGround: "都反对脱离目标争论唯一最佳语言，并认为路线应该允许调整。",
    difference: "他给出“阶段目标后再切换”的原则；你进一步提供了两周试学与复盘的方法。",
    challenge:
      "你的实验假设是“两周就能看出方向”。如果一个学生两周后两门语言都做得磕磕绊绊、仍然无法独立完成项目——你会让他延长实验，还是直接去补基础？",
    sampleAnswer:
      "这时问题已经不在语言，而在项目拆解和反馈质量。我会让他把项目砍到最小闭环，先学会求助和调试；基础可以用 C 的概念补，但不必立刻换语言重来。",
  },
  classNote: {
    before:
      "初学编程应该先学 Python，因为反馈更快；用两周试学实验记录反馈速度、挫折点和求助成本，再决定路线。",
    heard: [
      "C 组认为底层概念不能一直回避，“会写”和“懂原理”的差距会越拉越大。",
      "项目组认为先定项目，语言争论会自然消解。",
      "概念组提醒：真正可迁移的是控制流、分解与测试。",
      "同桌追问：两周实验看不出结果时，到底该怎么办？",
    ],
    changed:
      "实验本身也可能失败——两周看不出方向时，需要预设“失败信号”，而不是无限延长试学。",
    after:
      "初学者可以先用 Python 建立正反馈，但应该设置明确的阶段退出条件：例如到期仍无法独立完成最小闭环，就把问题归因到拆解与反馈，先补调试与求助能力，再决定是否转向 C 和系统基础。",
    afterHighlights: [
      "设置明确的阶段退出条件",
      "到期仍无法独立完成最小闭环",
      "先补调试与求助能力",
      "再决定是否转向 C 和系统基础",
    ],
  },
  mySeat: {
    viewpoint:
      "第一门语言的选择应是一次“带退出条件的短周期实验”，而不是一次性押注。",
    reasons:
      "两周真实项目能同时暴露反馈速度、挫折点与求助成本，比争论流行度更接近自己的答案。",
    addedCondition:
      "实验必须预设失败信号：到期仍无法独立完成最小闭环时，先补项目拆解、调试与求助能力，再决定是否换语言。",
    delta:
      "五个小组讨论的是“哪条路径更优”；我更关心的是——什么时候应该从 Python 的快速反馈阶段，转向系统基础学习。",
  },
  zhihuDraft: {
    title: "初学编程应该先学 C 还是 Python？",
    outline: [
      {
        label: "观点",
        text: "不必一次选对：把第一门语言当成一次“带退出条件的两周试学实验”。",
      },
      {
        label: "论据",
        text: "用反馈速度、挫折点、求助成本三个指标复盘实验；全班讨论已认可“第一门语言不决定上限”，真正的问题是何时切换。",
      },
      {
        label: "结构",
        text: "先给出实验设计 → 回答“实验失败了怎么办”（失败信号与退出条件）→ 说明什么时候该补 C 与系统基础。",
      },
    ],
    note: "回答提纲草稿 · 由《我的一席》整理 · 正式发布需回到知乎亲自完成",
  },
  nextClassroom: {
    number: "102",
    title: "学 Python 到什么程度，应该开始补系统基础？",
    causalNote: "本班黑板上尚未解决的问题，正是下一间教室的主题。",
    statusNote: "Mock 入口 · 本轮仅 101 完整开放",
  },
};
