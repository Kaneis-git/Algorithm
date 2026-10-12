"use client";
import { useEffect, useState } from "react";
import type { HistoryEntry } from "@/types/search";
export function SearchHistory() {
  const [items, setItems] = useState<HistoryEntry[]>([]), [error, setError] = useState(""), [loaded, setLoaded] = useState(false), [pending, setPending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try { const r = await fetch("/api/history", { cache: "no-store", signal: controller.signal }); if (!r.ok) throw new Error(); const d = await r.json() as { history: HistoryEntry[] }; if (!controller.signal.aborted) { setItems(d.history); setLoaded(true); setError(""); } }
      catch { if (!controller.signal.aborted) setError("历史记录读取失败，请稍后重试或检查云端数据库状态。"); }
    }
    void load(); return () => controller.abort();
  }, [attempt]);
  async function clear() {
    setPending(true);
    try { const r = await fetch("/api/history", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }); if (!r.ok) throw new Error(); setItems([]); setError(""); }
    catch { setError("清空历史失败，请重试。"); } finally { setPending(false); }
  }
  return <div className="space-y-3">
    {error && <p role="alert" className="text-sm text-red-700">{error} <button onClick={() => setAttempt((n) => n + 1)} className="underline">重试</button></p>}
    {!loaded && !error && <p role="status" className="text-sm text-slate-500">正在读取搜索历史…</p>}
    {loaded && !items.length && <p className="rounded-2xl border border-dashed border-emerald-200 p-6 text-sm leading-6 text-slate-500">你的搜索历史会保存在这里。从上方输入一个主题开始。</p>}
    <div className="grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2">{items.map((item) => <a key={item.query} href={`/search?q=${encodeURIComponent(item.query)}`} className="rounded-2xl border border-emerald-100 bg-white p-4 hover:bg-emerald-50"><p className="break-words text-sm font-bold text-emerald-950">{item.query}</p><p className="mt-2 text-xs text-slate-500">{new Date(item.searchedAt).toLocaleString("zh-CN")} · {item.count} 次</p></a>)}</div>
    {!!items.length && <button disabled={pending} onClick={() => void clear()} className="text-xs text-slate-500 underline disabled:opacity-50">{pending ? "正在清空…" : "清空搜索历史"}</button>}
  </div>;
}
