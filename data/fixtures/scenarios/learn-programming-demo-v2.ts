export type DemoSeatmateScenario = {
  id: string;
  disclosure: string;
  noteText: string;
  claimTitle: string;
  candidate: {
    x: number;
    y: number;
    title: string;
    evidence: Array<{ label: string; explanation: string }>;
    coverageDisclosure: string;
  };
  seatmate: {
    studentId: string;
    rationale: string;
    commonGround: string;
    difference: string;
    prompt: string;
    response: string;
  };
};

export const learnProgrammingDemoV2Scenario: DemoSeatmateScenario = {
  id: "scenario_learn_programming_v2",
  disclosure: "Demo V2 · Mock 场景",
  noteText:
    "第一门语言不必一次选对。可以先用两周做一个足够小的真实项目，记录反馈速度、挫折点和求助成本，再决定继续 Python、转向 C，或补一门更贴近目标的语言。关键不是追随流行度，而是把试学当成一次可复盘的实验。",
  claimTitle: "用短周期试学实验决定第一门语言，而不是一次性押注",
  candidate: {
    x: 58,
    y: 83,
    title: "这里可能有你的一席",
    evidence: [
      {
        label: "与问题相关",
        explanation: "直接回应“第一门语言如何选择”，并给出可执行的决策方法。",
      },
      {
        label: "来自你的笔记",
        explanation: "示例笔记明确写出“两周试学、记录反馈、再决定路线”。",
      },
      {
        label: "当前覆盖较少",
        explanation: "当前演示样本提到因人调整，但很少把选择过程设计成可复盘实验。",
      },
    ],
    coverageDisclosure: "基于当前 40 条 Mock 来源、5 个观点簇的演示对比",
  },
  seatmate: {
    studentId: "stu_mock_40",
    rationale:
      "你们都关注“如何根据学习者调整路径”，但他强调路线切换的时机，你补充了先用短周期实验验证起点。",
    commonGround: "都反对脱离目标争论唯一最佳语言，并认为路线应该允许调整。",
    difference: "他给出“阶段目标后再切换”的原则；你进一步提供了两周试学与复盘的方法。",
    prompt: "如果两周试学后还是拿不准，你会建议看什么信号？",
    response:
      "我会先看三件事：你是否能独立完成一个小闭环、遇到问题时能否获得有效反馈，以及这条路线是否仍贴近你的目标。短期不顺并不等于语言不适合，但如果三项都持续缺失，就值得换一种起点。",
  },
};
