/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli run-code. */
async (page) => {
  const calls = [];
  const collect = async response => {
    if (response.request().method() === "POST" && /candidate-seat|learning-turn/.test(response.url())) {
      const body = await response.json();
      calls.push({ endpoint: response.url().replace(/^https?:\/\/[^/]+/, ""), status: response.status(), mode: body.meta?.mode, resultStatus: body.data?.status, stage: body.data?.stage });
    }
  };
  page.on("response", collect);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("https://zhiyu-yixi.vercel.app/classroom/q_learn_programming");
  await page.getByRole("button", { name: "听听各组怎么说", exact: true }).click();
  await page.getByRole("button", { name: "使用示例观点", exact: true }).waitFor();
  const note = "我倾向先用 Python 做一次两周的试学实验，而不是立刻决定长期方向。实验只做一个小功能，每天记录获得反馈所需时间、反复卡住的知识点与求助成本。我会先写好继续、缩小项目和补基础的触发条件，并把环境配置错误与语法错误分开记录，防止把电脑配置困难误判成语言本身不合适。";
  const answer = "我会先用老师确认能运行的最小例子排查环境，再把项目缩小为一个输入和一个输出；如果在两个不同的小任务里反复卡在同一语法概念，就暂停扩展并补一个针对性练习。单次反馈慢不能说明语言不合适，只有排除环境和任务规模后仍无法满足自己的目标，才考虑换路线。这些记录只是帮助做决定，不能证明已经掌握。";
  await page.getByRole("textbox", { name: "你的初始观点", exact: true }).fill(note);
  await page.getByRole("button", { name: "找到我的一席", exact: true }).click();
  await page.getByRole("heading", { name: "这里可能有你的一席", exact: true }).waitFor({ timeout: 35000 });
  await page.getByRole("button", { name: "认识我的同桌", exact: true }).click();
  await page.getByRole("button", { name: "让他追问我", exact: true }).click();
  await page.getByRole("textbox", { name: "你的回应", exact: true }).waitFor({ timeout: 35000 });
  await page.getByRole("textbox", { name: "你的回应", exact: true }).fill(answer);
  await page.getByRole("button", { name: "写下我的回应", exact: true }).click();
  await page.getByRole("button", { name: "提炼成《我的一席》", exact: true }).waitFor({ timeout: 35000 });
  const text = await page.getByRole("complementary").innerText();
  if (!text.includes(note) || !text.includes(answer)) throw new Error("Original expression missing");
  await page.getByRole("button", { name: "提炼成《我的一席》", exact: true }).click();
  await page.getByRole("button", { name: "留下我的这一席", exact: true }).click();
  await page.getByRole("heading", { name: "这一课，留下了你的观点", exact: true }).waitFor();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载课堂笔记", exact: true }).click();
  const download = await downloading;
  await download.saveAs("output/playwright/TASK-027/live-101-qa-note.md");
  await page.screenshot({ path: "output/playwright/TASK-027/live-101-seated-1366.png" });
  page.off("response", collect);
  if (calls.length !== 3 || calls.some(call => call.status !== 200 || call.mode !== "live")) throw new Error("Three live stages were not completed");
  return { testedAt: new Date().toISOString(), syntheticQaInput: true, classroom: "101", classroomSource: "real_zhihu_snapshot", calls, inputPreserved: true, downloaded: true, seated: true };
}
