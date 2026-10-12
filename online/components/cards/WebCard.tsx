import { FavoriteButton } from "@/components/favorites/FavoritesProvider";
import { ArrowUpRight, CalendarDays, Globe2 } from "lucide-react";

import type { WebSearchResult } from "@/types/search";

interface WebCardProps {
  result: WebSearchResult;
}

export function WebCard({ result }: WebCardProps) {
  const domainInitial = result.domain.charAt(0).toUpperCase();

  return (
    <article className="group rounded-[22px] border border-[#e0e6e2] bg-white p-5 shadow-[0_10px_32px_rgba(35,59,50,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c3d1ca] hover:shadow-[0_18px_45px_rgba(35,59,50,0.09)]">
      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
        aria-label={`${result.title}，在新标签页打开网页`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf2fa] text-sm font-black text-[#396f9d]">
              {domainInitial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-[#40534b]">{result.source}</span>
              <span className="mt-0.5 block truncate text-[10px] font-medium text-[#929d98]">{result.domain}</span>
            </span>
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#e3e8e5] text-[#7d8984] transition-all group-hover:border-[#b9cdc4] group-hover:bg-[#edf7f2] group-hover:text-[#1f715a]">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
        <h3 className="mt-5 line-clamp-2 text-[15px] font-extrabold leading-6 tracking-[-0.015em] text-[#17231f] group-hover:text-[#1c6c56]">
          {result.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-[#69766f]">{result.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[#edf0ee] pt-4 text-[11px] font-medium text-[#89958f]">
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="size-3.5" aria-hidden="true" />
            网页
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {result.publishedAt}
          </span>
        </div>
      </a>
      <div className="px-3 pb-2"><FavoriteButton result={result} /></div>
    </article>
  );
}
