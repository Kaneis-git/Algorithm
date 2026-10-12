import { FavoriteButton } from "@/components/favorites/FavoritesProvider";
import { ArrowUpRight, FileText, Presentation } from "lucide-react";

import type { PptSearchResult } from "@/types/search";

interface PPTCardProps {
  result: PptSearchResult;
}

export function PPTCard({ result }: PPTCardProps) {
  return (
    <article className="group rounded-[22px] border border-[#e0e6e2] bg-white p-5 shadow-[0_10px_32px_rgba(35,59,50,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c3d1ca] hover:shadow-[0_18px_45px_rgba(35,59,50,0.09)]">
      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
        aria-label={`${result.title}，在新标签页打开资源`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0e9] text-[#b95e3c]">
            <Presentation className="size-5" strokeWidth={2} aria-hidden="true" />
            <span className="absolute -bottom-1 -right-1 rounded-md border-2 border-white bg-[#c86a45] px-1.5 py-0.5 text-[7px] font-black tracking-wide text-white">
              {result.fileType}
            </span>
          </span>
          <span className="grid size-8 place-items-center rounded-full border border-[#e3e8e5] text-[#7d8984] transition-all group-hover:border-[#b9cdc4] group-hover:bg-[#edf7f2] group-hover:text-[#1f715a]">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
        <h3 className="mt-5 line-clamp-2 text-base font-extrabold leading-6 tracking-[-0.015em] text-[#17231f] group-hover:text-[#1c6c56]">
          {result.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#69766f]">{result.description}</p>
        <div className="mt-5 flex items-center gap-2 border-t border-[#edf0ee] pt-4 text-[11px] font-semibold text-[#819089]">
          <FileText className="size-3.5" aria-hidden="true" />
          <span className="truncate">{result.domain}</span>
          <span className="ml-auto text-[#2a745f]">{result.source}</span>
        </div>
      </a>
      <div className="px-3 pb-2"><FavoriteButton result={result} /></div>
    </article>
  );
}
