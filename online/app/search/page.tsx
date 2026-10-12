import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchWorkbench } from "@/components/search/SearchWorkbench";
import { EmptyState } from "@/components/states/EmptyState";
import type { SearchTab } from "@/types/search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const value = (s: string | string[] | undefined) => Array.isArray(s) ? s[0] || "" : s || "";
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = value((await searchParams).q).slice(0, 80);
  return { title: query ? `${query} 学习资源 · KnowledgeHub AI` : "搜索学习资源 · KnowledgeHub AI" };
}
export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = value(params.q).normalize("NFKC").trim();
  const requested = value(params.type);
  const tab = (["all", "github", "video", "ppt", "web"].includes(requested) ? requested : "all") as SearchTab;
  return <main className="min-h-screen bg-[#f6f8f5]">
    <SiteHeader compact />
    <div className="mx-auto max-w-[1180px] space-y-8 px-5 pb-20 pt-5 sm:px-8">
      <SearchBar initialValue={query.slice(0,80)} variant="compact" />
      {!query ? <EmptyState title="先输入一个学习主题" description="搜索视频、PPT、GitHub 项目和网页。" /> : query.length > 80 ? <p role="alert">主题不能超过 80 个字符。</p> : <>
        <h1 className="text-2xl font-black text-emerald-950 sm:text-3xl">“{query}” 的学习资源</h1>
        <SearchWorkbench key={query} query={query} initialTab={tab} />
      </>}
    </div>
  </main>;
}
