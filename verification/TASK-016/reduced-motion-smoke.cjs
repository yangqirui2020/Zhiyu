/* eslint-disable @typescript-eslint/no-require-imports */

const puppeteer = require(process.env.PUPPETEER_CORE_PATH ?? "puppeteer-core");

const chromePath =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const url =
  process.env.TASK_016_URL ??
  "http://localhost:3000/classroom/q_learn_programming";

async function clickButton(page, text) {
  const buttons = await page.$$("button");
  for (const button of buttons) {
    const label = await button.evaluate((element) => element.textContent?.trim());
    if (label?.includes(text)) {
      await button.click();
      return;
    }
  }
  throw new Error(`未找到按钮：${text}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForSelector("canvas", { timeout: 15000 });
  await clickButton(page, "听听各组怎么说");

  await page.waitForFunction(
    () => document.body.innerText.includes("听完他们，你现在怎么看？"),
    { timeout: 2000 },
  );

  const stillShowingRoundtable = await page.evaluate(() =>
    document.body.innerText.includes("跳过，直接看黑板"),
  );
  if (stillShowingRoundtable) {
    throw new Error("Reduced Motion 下圆桌仍未自动结束");
  }
  if (consoleErrors.length || pageErrors.length) {
    throw new Error(
      [...consoleErrors, ...pageErrors].join("\n") || "浏览器发生未知错误",
    );
  }

  await browser.close();
  console.log("PASS: Reduced Motion 自动进入 Reflection，0 console/page error");
})().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
