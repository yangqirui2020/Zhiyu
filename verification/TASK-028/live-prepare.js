/* eslint-disable @typescript-eslint/no-unused-expressions -- Executed by playwright-cli run-code. */
async (page) => {
  await page.goto('http://localhost:3006/classroom/q_learn_programming');
  await page.reload();
  await page.getByRole('button',{name:'带一段经历来 →',exact:true}).click();
  await page.getByRole('textbox',{name:'发生了什么',exact:true}).fill('这是验收用的虚构情境：我学 Python 时想把摄影社团一百多张照片按拍摄日期归档，第一次脚本在文件名带中文时停止了，我不知道是不是语言不适合自己。');
  await page.getByRole('textbox',{name:'你采取了什么办法',exact:true}).fill('我把任务缩小成复制两张照片，保留原文件不动，并记录报错路径；后来发现是目标目录不存在，先创建目录后才继续测试。');
  await page.getByRole('textbox',{name:'结果与仍不确定的地方',exact:true}).fill('两张照片成功复制，但还没检验重名文件和没有拍摄日期的照片，所以不能把这个小结果叫作项目完成。');
  const pending = page.waitForResponse(response => response.url().includes('/learning-turn') && response.request().method()==='POST',{timeout:35000});
  await page.getByRole('button',{name:'让同桌追问一个细节 →',exact:true}).click();
  const response = await pending; const body = await response.json();
  return {status:response.status(),mode:body.meta?.mode,stage:body.data?.stage,question:body.data?.seatmate?.challenge,error:body.error?.message};
}
