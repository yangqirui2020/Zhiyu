/* eslint-disable @typescript-eslint/no-unused-expressions -- Function expression is executed by playwright-cli run-code. */
async (page) => {
  const origin = page.url().split("/").slice(0, 3).join("/");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => { for (const key of Object.keys(sessionStorage)) if (key.startsWith("zhiyu-classroom-entered:")) sessionStorage.removeItem(key); });
  await page.goto(`${origin}/classroom/q_projects_and_foundations`);
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(2300);
  await page.screenshot({ path: "output/playwright/TASK-026/102-normal-motion-ready-1440.png" });
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas unavailable");
  // The same frame used for the rendered screenshot has a student in this first desk.
  await page.mouse.click(box.x + 153, box.y + 228);
  // Hit areas are checked through the complete DOM keyboard route in the matrix;
  // normal-motion verification continues through the primary lesson controls.
  if (await page.getByRole("button", { name: "关闭学生详情" }).count()) await page.getByRole("button", { name: "关闭学生详情" }).click();
  await page.getByRole("button", { name: "听听各组怎么说", exact: true }).click();
  await page.getByRole("button", { name: "跳过，直接看黑板", exact: true }).click();
  await page.getByRole("button", { name: "使用示例观点", exact: true }).click();
  await page.getByRole("button", { name: "找到我的一席", exact: true }).click();
  await page.getByRole("heading", { name: "这里可能有你的一席", exact: true }).waitFor();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "output/playwright/TASK-026/102-normal-motion-candidate-1440.png" });
  await page.getByRole("button", { name: "认识我的同桌", exact: true }).click();
  await page.getByRole("button", { name: "让他追问我", exact: true }).waitFor();
  await page.screenshot({ path: "output/playwright/TASK-026/102-seatmate-1440.png" });
  return JSON.stringify({ normalEntrance: true, roundtableSkip: true, candidateReveal: true, peerPrepared: true });
}
