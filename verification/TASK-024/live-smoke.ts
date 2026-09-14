import {readSnapshotBundle} from "../../src/server/providers/snapshot/snapshot-bundle.ts";
import {runLearningTurn} from "../../src/server/use-cases/run-learning-turn.ts";
import {hashNote} from "../../src/server/pipelines/candidate-seat/analyze.ts";
import {writeFile} from "node:fs/promises";
const {classroom}=await readSnapshotBundle();
const context=()=>({requestId:"req_live_learning_qa",signal:new AbortController().signal,deadlineAt:Date.now()+25000,mode:"live" as const});
const cases=[
 ["environment","我会先检查学校机房的软件安装限制。如果无法安装解释器，就先选能在浏览器离线运行的教学环境，用同一段程序测试保存和再次打开是否可靠，再选匹配这个环境的语言，避免把环境受限误认为自己学不会编程。","我会在断网时写出一个加法程序，保存后关闭浏览器再重新打开运行。如果无法恢复，我就优先用学校现有软件，并向老师询问可以保存练习的路径，不急着把卡住归因于语言难。"],
 ["accessibility","零基础选择第一门编程语言之前，我会先测试教学环境的无障碍支持。因为我主要用键盘和屏幕阅读器操作电脑，我需要确认编辑器能读出缩进和报错，能独立运行程序，再选择在这些条件下最容易持续练习的语言。","我暂时保持原来的观点，还没有确定具体的测试门槛，需要先实际试用编辑器和屏幕阅读器后再补充。"]
];
const results=[];
for(const [name,noteText,answerText] of cases){
 const started=Date.now();const base={schemaVersion:"1.0.0-rc.2" as const,questionId:classroom.question.id,classroomRevision:classroom.revision,noteText};
 const p=await runLearningTurn({...base,stage:"prepare",idempotencyKey:"live_prepare_"+name+"_"+Date.now()},context());
 if(p.data.stage!=="prepared")throw Error("wrong prepare");
 const c=await runLearningTurn({...base,stage:"complete",answerText,challengeToken:p.data.challengeToken,idempotencyKey:"live_complete_"+name+"_"+Date.now()},context());
 if(c.data.stage!=="completed")throw Error("wrong complete");
 if(c.data.classNote.before!==noteText||c.data.classNote.changed!==answerText)throw Error("lost original input");
 const row={name,noteHash:hashNote(noteText),replyHash:hashNote(answerText),durationMs:Date.now()-started,modes:[p.meta.mode,c.meta.mode],seatmate:p.data.seatmate.studentId,challenge:p.data.seatmate.challenge,after:c.data.classNote.after,mySeat:c.data.mySeat,outlineLength:c.data.zhihuDraft.outline.length,evidenceIds:c.data.evidenceIds};
 console.log(JSON.stringify(row));results.push(row);
}
await writeFile("verification/TASK-024/live-smoke.json",JSON.stringify({testedAt:new Date().toISOString(),revision:classroom.revision,syntheticQa:true,results},null,2));
