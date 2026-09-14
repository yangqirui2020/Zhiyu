import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "知遇·一席",
  description: "一道问题，一间观点教室。带来一次经历，回应同桌追问，确认贡献卡，让黑板多一份可讨论的材料。",
  metadataBase: new URL("https://zhiyu-yixi.vercel.app"),
  openGraph: { title: "知遇·一席｜想听到你的一次经历", description: "三间观点教室，邀你带来一次尝试。讲经历、核对追问、确认贡献卡，再把这一席留给朋友。", type: "website", locale: "zh_CN" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
