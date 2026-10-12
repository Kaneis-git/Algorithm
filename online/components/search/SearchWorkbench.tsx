"use client";

import { useEffect, useState } from "react";
import { AISummary } from "./AISummary";
import { SearchResults } from "./SearchResults";
import { SearchTabs } from "./SearchTabs";
import type { SearchResponse, SearchTab } from "@/types/search";

const labels = { github: "GitHub", web: "网页", ppt: "PPT / PDF", video: "视频" };
const statusLabels = { ok: "完成", empty: "无结果", unconfigured: "待配置", disabled: "已关闭", error: "暂不可用" };
export function SearchWorkbench({ query, initialTab }: { query: string; initialTab: SearchTab }) {
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState(initialTab);
  useEffect(() => {
    const controller = new AbortController();
    async function run() {
      setLoading(true); setError(""); setResponse(null);
      try {
        const result = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, refresh: attempt > 0 }), signal: controller.signal });
        const data = await result.json() as SearchResponse & { error?: string };
        if (!result.ok) throw new Error(data.error || "搜索失败，请重试。");
        if (!controller.signal.aborted) setResponse(data);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "搜索失败，请重试。"); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void run();
    return () => controller.abort();
  }, [query, attempt]);
  function changeTab(value: SearchTab) {
    setTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set("type", value);
    window.history.replaceState(null, "", url);
  }
  const counts = response ? { all: Object.values(response.results).flat().length, github: response.results.github.length, video: response.results.videos.length, ppt: response.results.ppts.length, web: response.results.web.length } : { all: 0, github: 0, video: 0, ppt: 0, web: 0 };
  return <div className="space-y-6" aria-busy={loading}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500" aria-live="polite">{loading ? "正在搜索各个资源来源…" : response ? `共找到 ${counts.all} 条资源${response.cache?.hit ? " · 使用云端缓存" : ""}` : "搜索未完成"}</p>
      <button disabled={loading} onClick={() => setAttempt((n) => n + 1)} className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-900 disabled:opacity-50">重新搜索</button>
    </div>
    {loading && <div role="status" className="rounded-3xl border border-emerald-100 bg-white p-8"><p className="text-emerald-800">正在获取真实搜索结果，请稍候。</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{[1,2,3,4].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-emerald-50" />)}</div></div>}
    {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{error} 点击“重新搜索”再试一次。</div>}
    {response && <>
      {response.warnings?.map((warning) => <p key={warning} role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{warning}</p>)}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(response.providers).map(([key, value]) => <div key={key} className="rounded-2xl border border-emerald-100 bg-white p-4"><p className="text-sm font-bold text-emerald-950">{labels[key as keyof typeof labels]} · {statusLabels[value.status]}</p><p className="mt-2 text-xs leading-5 text-slate-500">{value.message || `返回 ${value.count} 条资源`}</p></div>)}</div>
      {response.expansion && <details className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm"><summary className="cursor-pointer font-bold text-emerald-900">{response.expansion.mode === "ai" ? "AI 查询扩展" : "规则查询扩展"} · 实际搜索 {response.usedQueries?.length || 1} 个词组</summary><div className="mt-3 flex flex-wrap gap-2">{response.expansion.queries.map((q) => <span key={q} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-900">{q}{response.usedQueries?.includes(q) ? " · 已搜索" : ""}</span>)}</div>{response.expansion.message && <p className="mt-3 text-xs text-slate-500">{response.expansion.message}</p>}</details>}
      {response.summary ? <AISummary summary={response.summary} /> : response.ai && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{response.ai.message} <a href="/settings" className="underline">配置说明</a></p>}
      <p className="text-xs text-slate-500">按标题、摘要、来源与更新信息计算相关度分数，并在各分类内排序；评分不是准确率。</p>
      <SearchTabs query={query} activeTab={tab} counts={counts} onChange={changeTab} />
      <SearchResults response={response} activeTab={tab} onChange={changeTab} />
    </>}
  </div>;
}
