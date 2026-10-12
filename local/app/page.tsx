import { SearchHistory } from "@/components/search/SearchHistory";
import {
  BookOpen,
  Clock3,
  GitBranch,
  Globe2,
  Layers3,
  Presentation,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/search/SearchBar";
import {
  sourceHighlights,
  trendingKeywords,
} from "@/lib/search/suggestions";

const resourceTypes = [
  { label: "视频", icon: Video, color: "bg-[#eaf4ef] text-[#27705a]" },
  { label: "PPT", icon: Presentation, color: "bg-[#fff0e9] text-[#b7603f]" },
  { label: "GitHub", icon: GitBranch, color: "bg-[#eef0f6] text-[#394664]" },
  { label: "优质网页", icon: Globe2, color: "bg-[#eaf2fa] text-[#376f9f]" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f9f6] text-[#17231f]">
      <div className="knowledge-grid pointer-events-none absolute inset-x-0 top-0 h-[680px] opacity-70" />
      <div className="pointer-events-none absolute left-[-150px] top-36 size-[360px] rounded-full bg-[#d8eee3]/60 blur-[95px]" />
      <div className="pointer-events-none absolute right-[-100px] top-8 size-[300px] rounded-full bg-[#e7efc7]/65 blur-[90px]" />

      <SiteHeader />

      <section className="relative mx-auto flex w-full max-w-[1040px] flex-col items-center px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24 lg:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e4de] bg-white/70 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#3c6a5a] shadow-sm backdrop-blur-md">
          <Sparkles className="size-3.5 text-[#4d8c72]" fill="currentColor" aria-hidden="true" />
          AI 驱动的个人学习资源聚合器
        </div>

        <h1 className="mt-7 max-w-[820px] text-[42px] font-black leading-[1.08] tracking-[-0.055em] text-[#14231f] sm:text-6xl lg:text-[72px]">
          从一个关键词，
          <span className="relative whitespace-nowrap text-[#226b57]">
            找到学习路径
            <svg className="absolute -bottom-1 left-0 w-full text-[#b8d866]" viewBox="0 0 320 14" fill="none" aria-hidden="true">
              <path d="M3 10C79 2 225 2 317 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-sm leading-7 text-[#66736d] sm:text-[17px] sm:leading-8">
          聚合视频、课程讲义、GitHub 项目与优质网页，再由 AI 帮你提炼知识脉络。
          <span className="hidden sm:inline">少一点搜索，多一点真正的学习。</span>
        </p>

        <div className="mt-9 w-full max-w-[800px]">
          <SearchBar autoFocus />
        </div>

        <div className="mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[11px] font-bold text-[#8a9690]">试试：</span>
          {trendingKeywords.slice(0, 4).map((keyword) => (
            <a
              key={keyword}
              href={`/search?q=${encodeURIComponent(keyword)}`}
              className="rounded-full border border-[#dde5e0] bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#5d6c65] transition-all hover:-translate-y-0.5 hover:border-[#afc6bb] hover:bg-white hover:text-[#1d6c56] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {keyword}
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4" aria-label="支持的资源类型">
          {resourceTypes.map(({ label, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl border border-[#e0e6e2] bg-white/65 px-3 py-2 shadow-sm backdrop-blur-sm">
              <span className={`grid size-7 place-items-center rounded-lg ${color}`}>
                <Icon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className="text-[11px] font-bold text-[#6d7a74]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-10">
        <div className="rounded-[30px] border border-[#dce4df] bg-white/80 p-5 shadow-[0_22px_70px_rgba(42,70,60,0.075)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#718079]">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    Recent searches
                  </div>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#17231f] sm:text-2xl">继续上次的探索</h2>
                </div>
                <BookOpen className="hidden size-5 text-[#9aaa9f] sm:block" aria-hidden="true" />
              </div>
              <SearchHistory />
            </div>

            <div className="border-t border-[#e3e8e5] pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#718079]">
                <TrendingUp className="size-3.5" aria-hidden="true" />
                Topic ideas
              </div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#17231f] sm:text-2xl">推荐主题</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {trendingKeywords.map((keyword, index) => (
                  <a
                    key={keyword}
                    href={`/search?q=${encodeURIComponent(keyword)}`}
                    className={`rounded-full px-3.5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                      index === 0
                        ? "bg-[#173f36] text-white shadow-sm"
                        : "border border-[#dfe6e2] bg-[#fafbf9] text-[#5f6e67] hover:border-[#b8c9c1] hover:bg-white hover:text-[#226b57]"
                    }`}
                  >
                    {keyword}
                  </a>
                ))}
              </div>
              <div className="mt-7 flex items-start gap-3 rounded-2xl bg-[#f1f5e6] p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#dff0a8] text-[#385d27]">
                  <Layers3 className="size-4" aria-hidden="true" />
                </span>
                <p className="text-[11px] leading-5 text-[#657159]">
                  <span className="font-extrabold text-[#405238]">一个主题，多种视角。</span>
                  <br />把分散资源组织成更容易行动的学习入口。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-[#dfe5e1] text-center">
          {sourceHighlights.map((item) => (
            <div key={item.label} className="px-3">
              <span className="block text-lg font-black tracking-[-0.03em] text-[#1f604f] sm:text-xl">{item.value}</span>
              <span className="mt-1 block text-[9px] font-bold leading-4 text-[#8a9690] sm:text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-[#e1e7e3] bg-white/45 px-5 py-6 text-center text-[10px] font-semibold tracking-wide text-[#8b9791]">
        KnowledgeHub AI · 为长期学习而设计
      </footer>
    </main>
  );
}
