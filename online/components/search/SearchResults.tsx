import type { LucideIcon } from "lucide-react";
import { FileText, GitBranch, Globe2, Video } from "lucide-react";
import type { ReactNode } from "react";

import { GithubCard } from "@/components/cards/GithubCard";
import { PPTCard } from "@/components/cards/PPTCard";
import { VideoCard } from "@/components/cards/VideoCard";
import { WebCard } from "@/components/cards/WebCard";
import type { SearchResponse, SearchResultType, SearchTab } from "@/types/search";

interface SearchResultsProps {
  response: SearchResponse;
  activeTab: SearchTab;
  onChange?: (tab: SearchTab) => void;
}

interface ResultSectionProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  count: number;
  query: string;
  type: SearchResultType;
  showAllLink: boolean;
  children: ReactNode;
  onChange?: (tab: SearchTab) => void;
}

function ResultSection({
  icon: Icon,
  label,
  title,
  description,
  count,
  query,
  type,
  showAllLink,
  children,
  onChange,
}: ResultSectionProps) {
  return (
    <section className="scroll-mt-28" aria-labelledby={`${type}-results-heading`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl border border-[#dce5e0] bg-white text-[#276b58] shadow-sm">
            <Icon className="size-4.5" strokeWidth={2.1} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7b8983]">{label}</span>
              <span className="rounded-full bg-[#e8f1ec] px-2 py-0.5 text-[9px] font-black text-[#33725f]">{count}</span>
            </div>
            <h2 id={`${type}-results-heading`} className="mt-1 text-lg font-black tracking-[-0.025em] text-[#17231f] sm:text-xl">
              {title}
            </h2>
            <p className="mt-1 hidden text-xs text-[#7b8781] sm:block">{description}</p>
          </div>
        </div>
        {showAllLink && (
          <a
            onClick={onChange ? (event) => { event.preventDefault(); onChange(type); } : undefined}
            href={`/search?q=${encodeURIComponent(query)}&type=${type}`}
            className="shrink-0 rounded-lg text-xs font-extrabold text-[#267159] underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            查看全部
          </a>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{count ? children : <p className="rounded-xl border border-dashed border-emerald-200 p-6 text-sm text-slate-500 md:col-span-2">此分类暂无结果，请查看上方来源状态或换一个主题。</p>}</div>
    </section>
  );
}

export function SearchResults({ response, activeTab, onChange }: SearchResultsProps) {
  const { results, query } = response;
  const isAll = activeTab === "all";
  const take = <T,>(items: T[]) => (isAll ? items.slice(0, 2) : items);

  return (
    <div className="space-y-10">
      {(isAll || activeTab === "video") && (
        <ResultSection
          icon={Video}
          label="Watch"
          title="推荐视频"
          description="通过讲解与实战建立直观理解"
          count={results.videos.length}
          query={query}
          type="video"
          showAllLink={isAll}
          onChange={onChange}
        >
          {take(results.videos).map((result, index) => (
            <VideoCard key={result.id} result={result} accentIndex={index} />
          ))}
        </ResultSection>
      )}

      {(isAll || activeTab === "ppt") && (
        <ResultSection
          icon={FileText}
          label="Study"
          title="PPT 与课程讲义"
          description="用结构化课件快速掌握知识骨架"
          count={results.ppts.length}
          query={query}
          type="ppt"
          showAllLink={isAll}
          onChange={onChange}
        >
          {take(results.ppts).map((result) => (
            <PPTCard key={result.id} result={result} />
          ))}
        </ResultSection>
      )}

      {(isAll || activeTab === "github") && (
        <ResultSection
          icon={GitBranch}
          label="Build"
          title="GitHub 开源项目"
          description="阅读真实代码，把知识带进项目"
          count={results.github.length}
          query={query}
          type="github"
          showAllLink={isAll}
          onChange={onChange}
        >
          {take(results.github).map((result) => (
            <GithubCard key={result.id} result={result} />
          ))}
        </ResultSection>
      )}

      {(isAll || activeTab === "web") && (
        <ResultSection
          icon={Globe2}
          label="Read"
          title="优质网页"
          description="从官方文档、教程和实践文章继续深入"
          count={results.web.length}
          query={query}
          type="web"
          showAllLink={isAll}
          onChange={onChange}
        >
          {take(results.web).map((result) => (
            <WebCard key={result.id} result={result} />
          ))}
        </ResultSection>
      )}
    </div>
  );
}
