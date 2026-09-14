/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli run-code. */
async (page) => {
  const origin = "http://localhost:3008";
  const calls = [], errors = [];
  const onError = error => errors.push(error.message);
  const onResponse = async response => {
    if (!response.url().includes("/api/v1/") || response.request().method() !== "POST") return;
    const body = await response.json();
    calls.push({ endpoint: response.url().replace(origin, ""), status: response.status(), mode: body.meta?.mode, stage: body.data?.stage, result: body.data?.status });
  };
  page.on("pageerror", onError); page.on("response", onResponse);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hold = ms => page.waitForTimeout(ms);
  const top = async () => { await page.evaluate(() => window.scrollTo(0, 0)); await hold(300); };
  const click = async name => page.getByRole("button", { name, exact: true }).click();
  const download = async (button, path) => { const pending = page.waitForEvent("download"); await click(button); const result = await pending; await result.saveAs(path); if (await result.failure()) throw new Error("Download failed"); };
  await page.goto(origin); await hold(4500);
  await page.getByRole("link", { name: "从 101 开始这段旅程", exact: true }).click(); await hold(4000);
  await page.getByText(/^打开 Canvas 等价文字视图/).click();
  await page.getByRole("button", { name: /^学生 01/ }).click(); await hold(4000);
  await page.keyboard.press("Escape"); await page.getByText(/^打开 Canvas 等价文字视图/).click(); await top();
  await click("听听各组怎么说"); await click("使用示例观点"); await hold(3500);
  await click("找到我的一席"); await page.getByRole("heading", { name: "这里可能有你的一席", exact: true }).waitFor(); await top(); await hold(4000);
  await click("认识我的同桌"); await page.getByRole("button", { name: "让他追问我", exact: true }).waitFor(); await hold(3000);
  await click("让他追问我"); await hold(2500); await click("填入参考回应（可修改）"); await hold(2500);
  await click("写下我的回应"); await page.getByRole("button", { name: "提炼成《我的一席》", exact: true }).waitFor(); await hold(3500);
  await click("提炼成《我的一席》"); await hold(2500); await click("留下我的这一席"); await hold(3000);
  await download("下载课堂笔记", "output/playwright/TASK-028/video-101-classnote.md");

  await page.getByRole("navigation", { name: "认知校园教室入口" }).getByRole("link", { name: /^102 / }).click(); await top(); await hold(3000);
  await click("带一段经历来 →"); await click("填入虚构示例");
  await page.getByRole("textbox", { name: "发生了什么", exact: true }).scrollIntoViewIfNeeded(); await hold(5000);
  await page.getByRole("textbox", { name: "结果与仍不确定的地方", exact: true }).scrollIntoViewIfNeeded(); await hold(3500);
  await click("让同桌追问一个细节 →");
  await page.getByRole("textbox", { name: "我对这次追问的回应", exact: true }).waitFor({ timeout: 35000 });
  const question = await page.getByRole("complementary").locator("blockquote").first().innerText(); await hold(5000);
  await page.getByRole("textbox", { name: "我对这次追问的回应", exact: true }).fill("我只比对了同一条提醒修改前后的输入值、保存值和页面显示值；还没做重新打开、多条提醒或跨日测试。后续会用两条日期不同的提醒，先改一条，检查另一条不变，再重新打开核对。现在能说的是这次修改生效，不能说整个工具已可靠。这些仍属于前面的虚构示例。");
  await hold(4500); await click("根据这次回应整理贡献卡 →");
  await page.getByRole("textbox", { name: "我希望课堂多考虑的一点", exact: true }).waitFor({ timeout: 35000 });
  await page.getByRole("textbox", { name: "我希望课堂多考虑的一点", exact: true }).scrollIntoViewIfNeeded(); await hold(4500);
  await page.getByRole("textbox", { name: "我希望课堂多考虑的一点", exact: true }).fill("把卡点缩小后，先核对输入、保存与显示，再补对应的基础；一次修复成功仍需要边界测试。");
  await hold(2500); await click("确认表述，把这份材料留在黑板上 →"); await top(); await hold(5500);
  await page.getByRole("button", { name: "返回课堂", exact: true }).scrollIntoViewIfNeeded(); await hold(3500);
  await download("下载我的贡献卡", "output/playwright/TASK-028/video-102-contribution.md");
  await page.getByRole("complementary").getByRole("button", { name: "邀请朋友来这间教室 ↗", exact: true }).click(); await hold(5000);
  await download("保存邀请图", "output/playwright/TASK-028/video-102-invite.png"); await hold(2500); await page.keyboard.press("Escape");

  await page.getByRole("navigation", { name: "认知校园教室入口" }).getByRole("link", { name: /^103 / }).click(); await top(); await hold(3500);
  await click("带一段经历来 →"); await click("填入虚构示例"); await hold(2500);
  await click("先由我自己整理"); await page.getByRole("textbox", { name: "我希望课堂多考虑的一点", exact: true }).scrollIntoViewIfNeeded(); await hold(3500);
  await click("确认表述，把这份材料留在黑板上 →"); await top(); await hold(5000);
  await download("下载我的贡献卡", "output/playwright/TASK-028/video-103-contribution.md");
  await page.getByRole("complementary").getByRole("button", { name: "邀请朋友来这间教室 ↗", exact: true }).click(); await hold(4500); await page.keyboard.press("Escape");
  await page.goto(origin); await hold(4000);
  page.off("pageerror", onError); page.off("response", onResponse);
  if (errors.length) throw new Error(errors.join("; "));
  if (calls.length !== 5 || calls.some(call => call.status !== 200) || calls.filter(call => call.mode === "live").length !== 2) throw new Error("Unexpected sample/live recording stages");
  return { recordedAt: new Date().toISOString(), viewport: page.viewportSize(), errors, calls, experienceQuestion: question, source: "local production build", inputs: "explicit fictional examples", audio: false };
}
