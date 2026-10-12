"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Favorite, SearchResult } from "@/types/search";
type FavoritesState = { favorites: Favorite[]; ready: boolean; error: string; pending: Set<string>; toggle: (result: SearchResult) => Promise<void>; reload: () => void };
const Context = createContext<FavoritesState | null>(null);
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [ready, setReady] = useState(false), [error, setError] = useState("");
  const [pending, setPending] = useState(new Set<string>());
  const active = useRef(new Set<string>());
  const [reloadIndex, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const r = await fetch("/api/favorites", { cache: "no-store", signal: controller.signal });
        if (!r.ok) throw new Error("收藏读取失败，请重新登录或稍后重试。");
        const d = await r.json() as { favorites: Favorite[] };
        if (!controller.signal.aborted) { setFavorites(d.favorites); setError(""); setReady(true); }
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "收藏读取失败。"); }
    }
    void load(); return () => controller.abort();
  }, [reloadIndex]);
  async function toggle(result: SearchResult) {
    if (!ready || active.current.has(result.url)) return;
    active.current.add(result.url); setPending(new Set(active.current)); setError("");
    const existing = favorites.find((f) => f.result.url === result.url);
    try {
      const r = await fetch("/api/favorites", { method: existing ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(existing ? { id: existing.result.id } : { result }) });
      const d = await r.json() as { error?: string; favorite?: Favorite };
      if (!r.ok) throw new Error(d.error || "收藏操作失败。");
      if (existing) setFavorites((rows) => rows.filter((f) => f.result.id !== existing.result.id));
      else {
        const favorite = d.favorite;
        if (!favorite) throw new Error("收藏保存结果无效，请重试。");
        setFavorites((rows) => [favorite, ...rows.filter((f) => f.result.url !== favorite.result.url)]);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "收藏操作失败，请重试。"); }
    finally { active.current.delete(result.url); setPending(new Set(active.current)); }
  }
  return <Context.Provider value={{ favorites, ready, error, pending, toggle, reload: () => setReload((n) => n + 1) }}>{children}</Context.Provider>;
}
export function useFavorites() { const value = useContext(Context); if (!value) throw new Error("FavoritesProvider is required"); return value; }
export function FavoriteButton({ result }: { result: SearchResult }) {
  const { favorites, ready, error, pending, toggle, reload } = useFavorites();
  const saved = favorites.some((f) => f.result.url === result.url);
  return <div className="mt-3 px-1 pb-1">
    <button type="button" aria-label={`${saved ? "取消收藏" : "收藏"}：${result.title}`} aria-pressed={saved} disabled={!ready || pending.has(result.url)} onClick={() => void toggle(result)} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">{pending.has(result.url) ? "正在保存…" : saved ? "★ 已收藏" : "☆ 收藏"}</button>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error} {!ready && <button onClick={reload} className="underline">重试</button>}</p>}
  </div>;
}
