import { ArrowLeft, SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "还没有可展示的结果",
  description = "换一个更具体的关键词试试，例如“Python asyncio 入门”。",
}: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-lg rounded-[28px] border border-[#dfe6e2] bg-white px-6 py-14 text-center shadow-[0_15px_45px_rgba(35,59,50,0.06)]">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf4f0] text-[#39715f]">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-black tracking-[-0.025em] text-[#17231f]">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#748079]">{description}</p>
      {/* Full-page navigation keeps Vinext reliable in non-secure local previews. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173f36] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#205648] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回首页搜索
      </a>
    </section>
  );
}
