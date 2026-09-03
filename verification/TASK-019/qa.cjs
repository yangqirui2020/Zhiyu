/* eslint-disable @typescript-eslint/no-require-imports */

const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH ?? "playwright-core");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.TASK_019_URL ?? "http://localhost:3000/classroom/q_learn_programming";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.join(__dirname, "shots");
const SAMPLE_OPINION_BUTTON = "使用示例观点";
const ARBITRARY_OPINION =
  "我认为初学编程不应该只比较语言名称，还应该观察课程质量、练习反馈和自己的学习目标，然后根据每周复盘结果决定下一步路线。这是一条任意输入，用来验证系统不会套用固定候选结论。";

fs.mkdirSync(OUT, { recursive: true });

function watch(page, errors, tag) {
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`[${tag}] ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`[${tag}] ${error.message}`));
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`shot: ${name}`);
}

async function enterReflection(page, timeout = 20_000) {
  await page.getByRole("button", { name: "听听各组怎么说" }).click();
  await page.getByRole("heading", { name: "听完他们，你现在怎么看？" }).waitFor({ timeout });
}

async function submitSampleOpinion(page) {
  await page.getByRole("button", { name: SAMPLE_OPINION_BUTTON }).click();
  await page.getByRole("button", { name: "找到我的一席" }).click();
  await page.getByRole("heading", { name: "这里可能有你的一席" }).waitFor();
}

async function finishLearningLoop(page) {
  await page.getByRole("button", { name: "认识我的同桌" }).click();
  await page.getByRole("button", { name: "让他追问我" }).click();

  const answer = page.getByRole("textbox", { name: "你的回应" });
  const submit = page.getByRole("button", { name: "写下我的回应" });
  await answer.fill("这是一条任意回应，不能触发固定的课堂笔记和《我的一席》。");
  if (await submit.isEnabled()) throw new Error("任意同桌回应错误地放行了固定学习产物");

  await page.getByRole("button", { name: "使用演示答案" }).click();
  if (!(await submit.isEnabled())) throw new Error("精确演示回应未能继续闭环");
  await submit.click();
  await page.getByRole("button", { name: "提炼成《我的一席》" }).click();
  await page.getByRole("button", { name: "留下我的这一席" }).click();
  await page.getByRole("heading", { name: "这一席，接下来可以去两个地方" }).waitFor();
}

(async () => {
  const errors = [];
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(BASE).origin,
  });

  const desktop = await context.newPage();
  watch(desktop, errors, "desktop");
  await desktop.setViewportSize({ width: 1440, height: 900 });
  await desktop.goto(BASE, { waitUntil: "networkidle" });
  await desktop.locator("canvas").waitFor();
  await desktop.waitForTimeout(2300);
  await shot(desktop, "01-exploring-1440");

  await desktop.getByRole("button", { name: "C 语言基础路径 8 位" }).click();
  await desktop.getByRole("heading", { name: "C 语言基础路径" }).waitFor();
  await shot(desktop, "02-cluster-inspector-1440");
  await desktop.getByRole("button", { name: "关闭观点组详情" }).click();

  await enterReflection(desktop);
  const opinion = desktop.getByRole("textbox", { name: "你的初始观点" });
  await opinion.fill(ARBITRARY_OPINION);
  await desktop.getByRole("button", { name: "找到我的一席" }).click();
  await desktop.getByText("当前演示分析没有找到可核验的一席。").waitFor();
  if (await desktop.getByRole("heading", { name: "这里可能有你的一席" }).count()) {
    throw new Error("任意观点错误地命中了 Sample Candidate");
  }
  await shot(desktop, "03-no-candidate-1440");

  await submitSampleOpinion(desktop);
  for (const label of ["相关性", "笔记支持", "样本覆盖"]) {
    await desktop.getByText(label, { exact: true }).waitFor();
  }
  await shot(desktop, "04-candidate-evidence-1440");
  await finishLearningLoop(desktop);

  const zhihu = desktop.getByRole("link", { name: /打开知乎/ });
  if ((await zhihu.getAttribute("href")) !== "https://www.zhihu.com/") {
    throw new Error("知乎出口不是合法的冻结问题 URL");
  }
  await desktop.getByRole("button", { name: "复制提纲" }).click();
  await desktop.getByText("已复制提纲").waitFor();
  await shot(desktop, "05-seated-exits-1440");
  await desktop.getByRole("button", { name: "重新开始这节课" }).click();
  await desktop.getByRole("heading", { name: "先认识这间像素教室" }).waitFor();

  const laptop = await context.newPage();
  watch(laptop, errors, "laptop");
  await laptop.setViewportSize({ width: 1366, height: 768 });
  await laptop.goto(BASE, { waitUntil: "networkidle" });
  await laptop.locator("canvas").waitFor();
  await laptop.waitForTimeout(2300);
  const laptopCta = await laptop.getByRole("button", { name: "听听各组怎么说" }).boundingBox();
  if (!laptopCta || laptopCta.y + laptopCta.height > 768) {
    throw new Error("1366×768 主 CTA 不在首屏");
  }
  await shot(laptop, "06-exploring-1366");

  const mobile = await context.newPage();
  watch(mobile, errors, "mobile");
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(BASE, { waitUntil: "networkidle" });
  await mobile.locator("canvas").waitFor();
  await mobile.waitForTimeout(2300);
  const mobileLayout = await mobile.evaluate(() => {
    const rail = document.querySelector("aside");
    const cta = [...document.querySelectorAll("button")].find((item) =>
      item.textContent?.includes("听听各组怎么说"),
    );
    const railRect = rail?.getBoundingClientRect();
    const ctaRect = cta?.getBoundingClientRect();
    return {
      fixed: rail ? getComputedStyle(rail).position === "fixed" : false,
      ctaVisible: Boolean(ctaRect && ctaRect.top >= 0 && ctaRect.bottom <= innerHeight),
      stageVisibleHeight: railRect ? railRect.top : 0,
      noHorizontalOverflow: document.body.scrollWidth <= document.documentElement.clientWidth,
    };
  });
  if (!mobileLayout.fixed || !mobileLayout.ctaVisible || !mobileLayout.noHorizontalOverflow) {
    throw new Error(`390×844 Bottom Sheet 失败：${JSON.stringify(mobileLayout)}`);
  }
  await shot(mobile, "07-exploring-bottom-sheet-390");
  await mobile.getByRole("button", { name: "Python 快速反馈路径 8 位" }).click();
  const overlap = await mobile.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const header = dialog?.querySelector("header")?.getBoundingClientRect();
    const body = dialog?.querySelector('[class*="sheetScroll"]')?.getBoundingClientRect();
    return Boolean(header && body && header.bottom > body.top);
  });
  if (overlap) throw new Error("移动端 Cluster Inspector 标题与内容重叠");
  await shot(mobile, "08-cluster-bottom-sheet-390");

  const reduced = await context.newPage();
  watch(reduced, errors, "reduced");
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.setViewportSize({ width: 1440, height: 900 });
  await reduced.goto(BASE, { waitUntil: "networkidle" });
  await reduced.locator("canvas").waitFor();
  await enterReflection(reduced, 2000);
  await submitSampleOpinion(reduced);
  await finishLearningLoop(reduced);
  await shot(reduced, "09-seated-reduced-motion-1440");

  await browser.close();
  if (errors.length) throw new Error(`浏览器错误：\n${errors.join("\n")}`);
  console.log("PASS: TASK-019 Golden Path / responsive / Reduced Motion / 0 console error");
})().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
