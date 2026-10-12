import { FavoriteButton } from "@/components/favorites/FavoritesProvider";
import { ArrowUpRight, Clock3, Play } from "lucide-react";

import type { VideoSearchResult } from "@/types/search";

interface VideoCardProps {
  result: VideoSearchResult;
  accentIndex?: number;
}

const thumbnailStyles = [
  "from-[#173f36] via-[#23594c] to-[#86a34f]",
  "from-[#242d45] via-[#3c526c] to-[#59988d]",
  "from-[#462c3a] via-[#73465a] to-[#d88967]",
  "from-[#332e23] via-[#645a37] to-[#b8a958]",
];

export function VideoCard({ result, accentIndex = 0 }: VideoCardProps) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#e0e6e2] bg-white shadow-[0_10px_32px_rgba(35,59,50,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c3d1ca] hover:shadow-[0_18px_45px_rgba(35,59,50,0.1)]">
      <a
        href={result.url}
        target="_blank"
        rel="noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
        aria-label={`${result.title}，在新标签页打开资源`}
      >
        <div className={`relative aspect-[16/8.5] overflow-hidden bg-gradient-to-br ${thumbnailStyles[accentIndex % thumbnailStyles.length]}`}>
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.09)_20%,rgba(255,255,255,0.09)_21%,transparent_21%,transparent_70%,rgba(255,255,255,0.06)_70%)]" />
          <div className="absolute -right-8 -top-10 size-36 rounded-full border border-white/15" />
          <div className="absolute -bottom-12 right-10 size-28 rounded-full bg-lime-200/10 blur-xl" />
          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4">
            <span className="rounded-full border border-white/20 bg-black/10 px-2.5 py-1 text-[9px] font-black tracking-[0.19em] text-white/80 backdrop-blur-sm">
              {result.thumbnailLabel}
            </span>
            <span className="grid size-8 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform group-hover:rotate-45">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-13 place-items-center rounded-full bg-white text-[#173f36] shadow-[0_10px_35px_rgba(0,0,0,0.22)] transition-transform group-hover:scale-110">
              <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
            </span>
          </div>
          {result.duration && <div className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-md bg-black/45 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Clock3 className="size-3" aria-hidden="true" />
            {result.duration}
          </div>}
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#728079]">
            <span className="text-[#2a745f]">{result.source}</span>
            <span className="size-1 rounded-full bg-[#c7d1cc]" />
            <span>{result.author || "作者未提供"}</span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-6 tracking-[-0.015em] text-[#17231f] transition-colors group-hover:text-[#1c6c56]">
            {result.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#69766f]">{result.description}</p>
          <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-[#8a9791]">
            <span>{result.publishedAt}</span>
            <span>相关度评分 {result.relevanceScore}</span>
          </div>
        </div>
      </a>
      <div className="px-3 pb-2"><FavoriteButton result={result} /></div>
    </article>
  );
}
