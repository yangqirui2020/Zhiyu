"use client";
import { useId, useRef, useState } from "react";
import { invitationFor } from "../../../data/contributions/invitations";
import { invitationText, publicClassroomUrl } from "./invitation";
import styles from "./contribution.module.css";

export function InviteClassroom({ questionId, title, synthetic }: { questionId: string; title: string; synthetic: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [feedback, setFeedback] = useState<"idle" | "copied" | "downloaded" | "manual" | "cancelled">("idle");
  const invitation = invitationFor(questionId).invitation;
  const text = invitationText(questionId, title, invitation);
  const download = async () => {
    try {
      const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
      context.fillStyle = "#f6f1e7"; context.fillRect(0, 0, 1080, 1350);
      context.fillStyle = "#324e43"; context.fillRect(48, 48, 984, 690);
      context.fillStyle = "#e6d7b8"; context.font = '28px "Microsoft YaHei", sans-serif'; context.fillText("知遇 · 一席 / 邀你带一段经历来", 88, 118);
      const write = (value: string, y: number, size: number, width: number, color: string) => {
        context.font = `600 ${size}px "Microsoft YaHei", sans-serif`; context.fillStyle = color;
        let line = "";
        for (const char of value) { if (context.measureText(line + char).width > width) { context.fillText(line, 88, y); y += size * 1.55; line = char; } else line += char; }
        if (line) { context.fillText(line, 88, y); y += size * 1.55; }
        return y;
      };
      const titleEnd = write(title, 230, 48, 890, "#fff9e9");
      write(invitation, Math.max(430, titleEnd + 35), 36, 890, "#e6d7b8");
      write("看见不同的想法，也把自己的尝试带进来。", 665, 27, 890, "#e6d7b8");
      write("一次尝试，也值得被听见。", 850, 48, 890, "#26372e");
      write("带来经历 · 补全条件 · 留下疑问", 930, 28, 890, "#324e43");
      write("讲一次经历 → 同桌追问 → 确认贡献卡 → 留下一席", 1020, 27, 890, "#324e43");
      write(publicClassroomUrl(questionId), 1140, 23, 880, "#324e43");
      context.font = '22px "Microsoft YaHei", sans-serif'; context.fillText(synthetic ? "本班使用明确标注的合成材料；用户自述未经独立核验。" : "本班使用真实知乎摘要快照；用户自述未经独立核验。", 88, 1300);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Image unavailable");
      const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `知遇一席-${questionId}-邀请.png`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000); setFeedback("downloaded");
    } catch { setFeedback("manual"); }
  };
  return <>
    <button type="button" className={styles.inviteTrigger} onClick={() => { setFeedback("idle"); dialog.current?.showModal(); }}>邀请朋友来这间教室 ↗</button>
    <dialog ref={dialog} className={styles.inviteDialog} aria-labelledby={titleId}>
      <div className={styles.dialogHeading}><div><p>把这一席留给真人</p><h2 id={titleId}>这一次，想听听你的经历</h2></div><button type="button" onClick={() => dialog.current?.close()} aria-label="关闭邀请">×</button></div>
      <h3>{title}</h3><p className={styles.invitation}>{invitation}</p>
      <p className={styles.disclosure}>邀请不包含你的经历、回应或贡献卡。朋友打开链接后，将在同一教室开始自己的体验。</p>
      <label className={styles.field}><span>可分享的邀请文字</span><textarea readOnly rows={8} value={text} onFocus={event => event.currentTarget.select()} /></label>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={async () => { try { await navigator.clipboard.writeText(text); setFeedback("copied"); } catch { setFeedback("manual"); } }}>复制邀请</button>
        <button type="button" onClick={() => void download()}>保存邀请图</button>
        <button type="button" onClick={async () => { if (!navigator.share) { setFeedback("manual"); return; } try { await navigator.share({ title: "知遇·一席｜邀请你的一次经历", text, url: publicClassroomUrl(questionId) }); } catch (error) { setFeedback(error instanceof DOMException && error.name === "AbortError" ? "cancelled" : "manual"); } }}>打开系统分享</button>
      </div>
      <p role="status">{feedback === "copied" ? "邀请已复制，可以发给愿意交流的朋友。" : feedback === "downloaded" ? "邀请图已保存，可与链接一起分享。" : feedback === "manual" ? "浏览器未完成操作。你可以选中上面的邀请文字，手动复制分享。" : feedback === "cancelled" ? "已取消分享，没有发送内容。" : "由你选择分享对象；应用不会自动发送消息。"}</p>
      <a href="https://www.zhihu.com/hackathon?activity_code=zhihu_hackathon_2026_p2" target="_blank" rel="noreferrer">查看知乎黑客松活动广场 ↗</a>
    </dialog>
  </>;
}
