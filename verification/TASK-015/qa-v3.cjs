/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * TASK-015 Demo V3 Golden Path Browser QA
 * puppeteer-core + 系统 Chrome（headless），覆盖：
 *  - 完整 Golden Path 10 步截图（1440×900）
 *  - 1366×768 / 390×844 关键相位截图
 *  - Reduced Motion 冒烟（圆桌跳过 + 入席直达）
 *  - console / pageerror 收集
 */
const puppeteer = require(process.env.PUPPETEER_CORE_PATH ?? "puppeteer-core");
const fs = require("node:fs");
const path = require("node:path");

const BASE = "http://localhost:3000/classroom/q_learn_programming";
const OUT = path.join(__dirname, "shots");
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const consoleErrors = [];
const pageErrors = [];

fs.mkdirSync(OUT, { recursive: true });

async function clickByText(page, selector, text, { exact = false } = {}) {
  const handle = await page.evaluateHandle(
    (sel, target, useExact) => {
      const nodes = [...document.querySelectorAll(sel)];
      return nodes.find((node) => {
        const content = (node.textContent || "").trim();
        return useExact ? content === target : content.includes(target);
      }) ?? null;
    },
    selector,
    text,
    exact,
  );
  const element = handle.asElement();
  if (!element) {
    throw new Error(`clickByText: 未找到 ${selector} 包含文本「${text}」`);
  }
  await element.scrollIntoView();
  await new Promise((r) => setTimeout(r, 150));
  await element.click();
}

async function waitForText(page, text, timeout = 8000) {
  await page.waitForFunction(
    (target) => document.body.innerText.includes(target),
    { timeout },
    text,
  );
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`shot: ${name}`);
}

function watch(page, tag) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${tag}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => pageErrors.push(`[${tag}] ${err.message}`));
}

async function goldenPath() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  watch(page, "desktop");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // 场景 1：初次进入，多观点组可辨
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 1600));
  await shot(page, "01-exploring-1440");

  // 场景 2：课代表圆桌进行中
  await clickByText(page, "button", "听听各组怎么说");
  await new Promise((r) => setTimeout(r, 2900));
  await shot(page, "02-roundtable-mid-1440");

  // 场景 3：黑板三项 + reflection
  await waitForText(page, "听完他们，你现在怎么看？", 25000);
  await new Promise((r) => setTimeout(r, 500));
  await shot(page, "03-reflection-blackboard-1440");

  // 场景 4：Candidate Seat Wow
  await clickByText(page, "button", "使用示例观点");
  await new Promise((r) => setTimeout(r, 200));
  await clickByText(page, "button", "找到我的一席");
  await new Promise((r) => setTimeout(r, 900));
  await shot(page, "04-candidate-1440");

  // 场景 5：同桌面板
  await clickByText(page, "button", "认识我的同桌");
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "05-seatmate-1440");

  // 场景 5b：同桌追问
  await clickByText(page, "button", "让他追问我");
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "06-challenge-1440");

  // 用户回应 → 课堂笔记（Before ≠ After）
  await clickByText(page, "button", "使用演示答案");
  await new Promise((r) => setTimeout(r, 200));
  await clickByText(page, "button", "写下我的回应");
  await waitForText(page, "这节课，我的认知发生了什么变化", 6000);
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "07-classnote-diff-1440");

  // 《我的一席》
  await clickByText(page, "button", "提炼成《我的一席》");
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, "08-myseat-1440");

  // 场景 7：入席
  await clickByText(page, "button", "留下我的这一席");
  await new Promise((r) => setTimeout(r, 900));
  await shot(page, "09-seated-1440");

  // 双出口：展开知乎提纲
  await clickByText(page, "summary", "查看回答提纲");
  await new Promise((r) => setTimeout(r, 300));
  await shot(page, "10-exits-zhihudraft-1440");

  // 学习出口：102 走廊入口
  await clickByText(page, "button", "102", { exact: false });
  await waitForText(page, "走廊上的 Classroom 102", 6000);
  await shot(page, "11-exit-nextroom-1440");

  await browser.close();
}

async function smallViewports() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });

  // 1366×768：exploring + candidate
  {
    const page = await browser.newPage();
    watch(page, "1366");
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));
    await shot(page, "20-exploring-1366");
    await clickByText(page, "button", "听听各组怎么说");
    await waitForText(page, "听完他们，你现在怎么看？", 25000);
    await clickByText(page, "button", "使用示例观点");
    await clickByText(page, "button", "找到我的一席");
    await new Promise((r) => setTimeout(r, 900));
    await shot(page, "21-candidate-1366");
    await page.close();
  }

  // 390×844：exploring + reflection + note
  {
    const page = await browser.newPage();
    watch(page, "390");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));
    await shot(page, "30-exploring-390");
    await clickByText(page, "button", "听听各组怎么说");
    await new Promise((r) => setTimeout(r, 2900));
    await shot(page, "31-roundtable-390");
    await waitForText(page, "听完他们，你现在怎么看？", 25000);
    await shot(page, "32-reflection-390");
    await clickByText(page, "button", "使用示例观点");
    await clickByText(page, "button", "找到我的一席");
    await new Promise((r) => setTimeout(r, 700));
    await clickByText(page, "button", "认识我的同桌");
    await clickByText(page, "button", "让他追问我");
    await clickByText(page, "button", "使用演示答案");
    await clickByText(page, "button", "写下我的回应");
    await waitForText(page, "认知发生了什么变化", 6000);
    await shot(page, "33-classnote-390");
    await page.close();
  }

  await browser.close();
}

async function reducedMotionSmoke() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  watch(page, "reduced");
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 800));

  // Reduced Motion 自动直达黑板，不依赖手动跳过
  await clickByText(page, "button", "听听各组怎么说");
  await waitForText(page, "听完他们，你现在怎么看？", 2000);
  await clickByText(page, "button", "使用示例观点");
  await clickByText(page, "button", "找到我的一席");
  await new Promise((r) => setTimeout(r, 400));
  await clickByText(page, "button", "认识我的同桌");
  await clickByText(page, "button", "让他追问我");
  await clickByText(page, "button", "使用演示答案");
  await clickByText(page, "button", "写下我的回应");
  await waitForText(page, "认知发生了什么变化", 6000);
  await clickByText(page, "button", "提炼成《我的一席》");
  await clickByText(page, "button", "留下我的这一席");
  await new Promise((r) => setTimeout(r, 500));
  await shot(page, "40-seated-reduced-motion");

  // reset：人数回 40、黑板三项消失
  await clickByText(page, "button", "重新开始这节课");
  await new Promise((r) => setTimeout(r, 500));
  await shot(page, "41-after-reset");

  await browser.close();
}

(async () => {
  const startedAt = Date.now();
  await goldenPath();
  await smallViewports();
  await reducedMotionSmoke();

  console.log("\n=== console errors ===");
  console.log(consoleErrors.length ? consoleErrors.join("\n") : "(none)");
  console.log("=== page errors ===");
  console.log(pageErrors.length ? pageErrors.join("\n") : "(none)");
  console.log(`done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

  if (consoleErrors.length > 0 || pageErrors.length > 0) process.exit(2);
})().catch((err) => {
  console.error("QA FAILED:", err.message);
  console.log("\n=== console errors ===");
  console.log(consoleErrors.join("\n") || "(none)");
  console.log("=== page errors ===");
  console.log(pageErrors.join("\n") || "(none)");
  process.exit(1);
});
