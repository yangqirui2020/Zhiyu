/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli run-code. */
async (page) => {
  const question = await page.getByRole('complementary').locator('blockquote').first().innerText();
  const answer = '我会准备两个内容不同但名字相同的测试文件，要求两个都保留并有可追溯的新名字；没有拍摄日期的照片放入待确认目录而不是猜日期。操作后比较源文件与目标文件数量，并检查原文件未被改动。这些是计划中的检验，还没有全部执行。';
  await page.getByRole('textbox',{name:'我对这次追问的回应',exact:true}).fill(answer);
  const pending = page.waitForResponse(response => response.url().includes('/learning-turn') && response.request().method()==='POST',{timeout:35000});
  await page.getByRole('button',{name:'根据这次回应整理贡献卡 →',exact:true}).click();
  const response = await pending; const body = await response.json();
  if(response.status()!==200) return {status:response.status(),error:body.error?.message};
  const summary = await page.getByRole('textbox',{name:'我希望课堂多考虑的一点',exact:true}).inputValue();
  const boundary = await page.getByRole('textbox',{name:'这段材料适用于什么，不能证明什么',exact:true}).inputValue();
  await page.getByRole('button',{name:'确认表述，把这份材料留在黑板上 →',exact:true}).click();
  const pendingDownload = page.waitForEvent('download');
  await page.getByRole('button',{name:'下载我的贡献卡',exact:true}).click();
  await (await pendingDownload).saveAs('output/playwright/TASK-028/live-101-contribution.md');
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:'output/playwright/TASK-028/live-101-contributed-1366.png',fullPage:true});
  return {testedAt:new Date().toISOString(),syntheticQaInput:true,status:response.status(),mode:body.meta?.mode,stage:body.data?.stage,question,answer,summary,boundary,evidenceIds:body.data?.evidenceIds,confirmed:true,downloaded:true};
}

