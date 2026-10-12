"use client";
import Link from "next/link";
import { useState } from "react";
import { useFavorites } from "./FavoritesProvider";
import { GithubCard } from "@/components/cards/GithubCard";
import { WebCard } from "@/components/cards/WebCard";
import { PPTCard } from "@/components/cards/PPTCard";
import { VideoCard } from "@/components/cards/VideoCard";
import type { SearchTab } from "@/types/search";
export function FavoritesView() {
  const { favorites, ready, error, reload } = useFavorites();
  const [query, setQuery] = useState(""), [type, setType] = useState<SearchTab>("all");
  const filtered = favorites.filter(({ result: r }) => (type === "all" || r.type === type) && `${r.title} ${r.description} ${r.source}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3"><input aria-label="搜索收藏" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="在收藏中搜索…" className="min-w-0 flex-1 rounded-2xl border border-emerald-200 bg-white p-3" /><select aria-label="收藏类型" value={type} onChange={(e) => setType(e.target.value as SearchTab)} className="rounded-2xl border border-emerald-200 bg-white p-3">{[["all","全部"],["video","视频"],["ppt","PPT / PDF"],["github","GitHub"],["web","网页"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>
    {error && <p role="alert" className="text-red-700">{error} <button className="underline" onClick={reload}>重试</button></p>}
    {!ready && !error && <p role="status">正在读取收藏…</p>}
    {ready && <><p className="text-sm text-slate-500">共 {favorites.length} 条收藏，当前显示 {filtered.length} 条</p>{filtered.length ? <div className="grid gap-5 md:grid-cols-2">{filtered.map(({ result: r }) => r.type === "github" ? <GithubCard key={r.id} result={r} /> : r.type === "video" ? <VideoCard key={r.id} result={r} /> : r.type === "ppt" ? <PPTCard key={r.id} result={r} /> : <WebCard key={r.id} result={r} />)}</div> : <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center text-slate-500">{favorites.length ? "没有符合条件的收藏。" : "还没有收藏。搜索一个主题，点击资源卡片上的“收藏”即可。"}<Link href="/" className="mt-4 block text-emerald-800 underline">去搜索</Link></div>}</>}
  </div>;
}
