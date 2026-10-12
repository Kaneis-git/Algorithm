import { ArrowRight, BookOpenCheck, Network, Route, Sparkles } from "lucide-react";

import type { AISummaryData } from "@/types/search";

interface AISummaryProps {
  summary: AISummaryData;
}

export function AISummary({ summary }: AISummaryProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#cfe0d7] bg-[#173f36] text-white shadow-[0_18px_50px_rgba(23,63,54,0.16)]">
      <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-5 -top-8 size-36 rounded-full bg-[#b7d95b]/10 blur-2xl" />
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative border-white/10 p-6 sm:p-8 lg:border-r lg:p-9">
          <div className="mb-5 flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-[#d4f07e] text-[#173f36]">
              <Sparkles className="size-4" fill="currentColor" aria-hidden="true" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#bfe5d7]">AI Topic Brief</span>
            <span className="ml-auto rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-white/65">
              AI 生成
            </span>
          </div>
          <h2 className="max-w-xl text-2xl font-black tracking-[-0.035em] sm:text-[30px]">{summary.title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d9e7e1] sm:text-[15px]">{summary.overview}</p>

          <div className="mt-7">
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold text-white/80">
              <BookOpenCheck className="size-4 text-[#d4f07e]" aria-hidden="true" />
              核心知识点
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {summary.coreKnowledge.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-black text-[#d4f07e]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold text-[#f1f7f4]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative bg-white/[0.035] p-6 sm:p-8 lg:p-9">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-extrabold text-white/80">
              <Network className="size-4 text-[#d4f07e]" aria-hidden="true" />
              相关概念
            </div>
            <div className="flex flex-wrap gap-2">
              {summary.relatedConcepts.map((concept) => (
                <span key={concept} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-bold text-[#d7e6e0]">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-7">
            <div className="mb-4 flex items-center gap-2 text-xs font-extrabold text-white/80">
              <Route className="size-4 text-[#d4f07e]" aria-hidden="true" />
              推荐学习顺序
            </div>
            <ol className="space-y-3">
              {summary.learningPath.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[#d4f07e]/35 bg-[#d4f07e]/10 text-[10px] font-black text-[#d4f07e]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#dce9e4]">{step}</span>
                  {index < summary.learningPath.length - 1 && (
                    <ArrowRight className="ml-auto size-3.5 text-white/25" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 sm:px-8"><p className="text-xs text-white/70">基于搜索标题与摘要生成，请结合原始资料核对。</p><ul className="mt-3 space-y-2">{summary.citations.map((source, index) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-[#d4f07e] underline underline-offset-4">[{index + 1}] {source.title}</a></li>)}</ul></div>
    </section>
  );
}
