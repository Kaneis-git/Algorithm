import { SiteHeader } from "@/components/layout/SiteHeader";
import { FavoritesView } from "@/components/favorites/FavoritesView";
export const metadata = { title: "我的收藏 · KnowledgeHub AI" };
export default function FavoritesPage() {
  return <main className="min-h-screen bg-[#f6f8f5]"><SiteHeader compact /><div className="mx-auto max-w-[1180px] px-5 pb-20 pt-6 sm:px-8"><h1 className="text-3xl font-black text-emerald-950">我的收藏</h1><p className="mb-8 mt-3 text-sm text-slate-500">保存在这台电脑上的学习资源，随时回来继续探索。</p><FavoritesView /></div></main>;
}
