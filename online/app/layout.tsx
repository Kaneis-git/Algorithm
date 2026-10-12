import type { Metadata } from "next";
import "./globals.css";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";

export const metadata: Metadata = {
  title: "KnowledgeHub AI",
  description: "AI 驱动的个人学习资源聚合器，把视频、PPT、GitHub 项目与优质网页整理到同一个学习视图。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body><FavoritesProvider>{children}</FavoritesProvider></body>
    </html>
  );
}
