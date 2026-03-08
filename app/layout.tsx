import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "合同审阅与撰写工作台",
  description: "上传合同后进行律师风格专业审阅，或按业务要求自动撰写可编辑合同。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
