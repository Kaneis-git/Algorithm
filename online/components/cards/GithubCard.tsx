import { FavoriteButton } from "@/components/favorites/FavoritesProvider";
import { ArrowUpRight, Circle, Code2, GitFork, Star } from "lucide-react";

import type { GithubSearchResult } from "@/types/search";

interface GithubCardProps {
  result: GithubSearchResult;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function GithubCard({ result }: GithubCardProps) {
  return (
    <article className="group rounded-[22px] border border-[#dfe5e2] bg-[#fbfcfb] p-5 shadow-[0_10px_32px_rgba(35,59,50,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#bdcbc4] hover:bg-white hover:shadow-[0_18px_45px_rgba(35,59,50,0.09)]">
      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
        aria-label={`${result.owner}/${result.repositoryName}，在新标签页打开 GitHub 项目`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#68746f]">
            <span className="grid size-8 place-items-center rounded-xl bg-[#18231f] text-white">
              <Code2 className="size-4" aria-hidden="true" />
            </span>
            {result.owner}
          </span>
          <ArrowUpRight className="size-4 text-[#8c9892] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#1f715a]" aria-hidden="true" />
        </div>
        <h3 className="mt-5 break-words text-[15px] font-black leading-6 tracking-[-0.015em] text-[#183f36]">
          {result.repositoryName}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#67746e]">{result.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {result.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="max-w-36 truncate rounded-full bg-[#e9f4ef] px-2.5 py-1 text-[10px] font-bold text-[#33725f]">
              {topic}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#e8ecea] pt-4 text-[11px] font-semibold text-[#75827c]">
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5 text-[#bc8931]" fill="currentColor" aria-hidden="true" />
            {formatCount(result.stars)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="size-3.5" aria-hidden="true" />
            {formatCount(result.forks)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Circle className="size-2.5 fill-[#5b9bd5] text-[#5b9bd5]" aria-hidden="true" />
            {result.language}
          </span>
          <span className="ml-auto text-[#9aa49f]">{result.updatedAt}</span>
        </div>
      </a>
      <div className="px-3 pb-2"><FavoriteButton result={result} /></div>
    </article>
  );
}
