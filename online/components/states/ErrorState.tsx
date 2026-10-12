"use client";

import { CircleAlert, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  onRetry?: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section className="mx-auto max-w-lg rounded-[28px] border border-[#eaded8] bg-white px-6 py-14 text-center shadow-[0_15px_45px_rgba(74,50,41,0.06)]">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#fff0ea] text-[#b45c3c]">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-black tracking-[-0.025em] text-[#17231f]">这次搜索没有顺利完成</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#748079]">
        资源服务暂时没有响应。你可以重新尝试，其他已经成功的来源不会受影响。
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#173f36] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#205648] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          重新搜索
        </button>
      )}
    </section>
  );
}
