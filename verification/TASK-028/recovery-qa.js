/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli run-code. */
async (page) => {
  const origin = page.url().split("/").slice(0, 3).join("/");
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  await page.goto(origin);
  await page.goto(`${origin}/classroom/q_learning_with_ai#experience`);
  await page.getByRole("button", { name: "填入虚构示例", exact: true }).click();
  const original = await page.getByRole("textbox", { name: "发生了什么", exact: true }).inputValue();
  let mode = "failure", calls = 0;
  const routeHandler = async route => {
    calls++;
    if (mode === "delay") await page.waitForTimeout(1800);
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "QA injected unavailable" } }) }).catch(() => {});
  };
  await page.route("**/api/v1/learning-turn", routeHandler);
  await page.getByRole("button", { name: "让同桌追问一个细节 →", exact: true }).click();
  await page.getByText("没有完成，经历仍然保留。", { exact: true }).waitFor();
  await page.getByRole("button", { name: "重试这次追问", exact: true }).click();
  await page.getByRole("button", { name: "返回修改经历", exact: true }).waitFor();
  check(calls === 2, "Retry did not issue a fresh request");
  await page.getByRole("button", { name: "返回修改经历", exact: true }).click();
  check(await page.getByRole("textbox", { name: "发生了什么", exact: true }).inputValue() === original, "Retry lost original input");
  mode = "delay";
  await page.getByRole("button", { name: "让同桌追问一个细节 →", exact: true }).click();
  await page.getByRole("button", { name: "取消并返回课堂", exact: true }).click();
  await page.waitForTimeout(2100);
  check(await page.getByRole("alert").filter({ hasText: "没有完成" }).count() === 0, "Late error reopened panel");
  await page.getByRole("button", { name: "继续我的经历 →", exact: true }).click();
  check(await page.getByRole("textbox", { name: "发生了什么", exact: true }).inputValue() === original, "Cancel lost original input");
  await page.getByRole("button", { name: "先由我自己整理", exact: true }).click();
  await page.getByRole("button", { name: "确认表述，把这份材料留在黑板上 →", exact: true }).click();
  await page.getByRole("button", { name: "返回课堂", exact: true }).click();
  const inviteTrigger = page.getByRole("button", { name: "邀请朋友来这间教室 ↗", exact: true });
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: async () => { throw new DOMException("QA blocked", "NotAllowedError"); } });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("QA cancellation", "AbortError"); } });
    Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", { configurable: true, value: (callback) => callback(null) });
  });
  await inviteTrigger.click();
  const dialog = page.getByRole("dialog", { name: "这一次，想听听你的经历" });
  await dialog.getByRole("button", { name: "复制邀请", exact: true }).click();
  await dialog.getByText("浏览器未完成操作。你可以选中上面的邀请文字，手动复制分享。", { exact: true }).waitFor();
  check((await dialog.getByRole("textbox").inputValue()).includes("q_learning_with_ai#experience"), "Manual fallback missing link");
  await dialog.getByRole("button", { name: "保存邀请图", exact: true }).click();
  await dialog.getByText("浏览器未完成操作。你可以选中上面的邀请文字，手动复制分享。", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "打开系统分享", exact: true }).click();
  await dialog.getByText("已取消分享，没有发送内容。", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await page.reload();
  check(await page.getByRole("button", { name: /^黑板新增一份材料/ }).count() === 0, "Refresh did not clear session-only board");
  await page.unroute("**/api/v1/learning-turn", routeHandler);
  await page.goto(origin);
  return { testedAt: new Date().toISOString(), origin, prepareRetry: true, inputPreserved: true, cancellation: true, lateResultIgnored: true, explicitManualRecovery: true, clipboardDeniedFallback: true, imageFailureFallback: true, shareCancellation: true, refreshClearsBoard: true };
}
