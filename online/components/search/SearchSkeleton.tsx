import { FileText, GitBranch, Globe2, Video } from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";

const loadingSources = [
  { label: "正在搜索视频", icon: Video },
  { label: "正在搜索 GitHub", icon: GitBranch },
  { label: "正在搜索 PPT", icon: FileText },
  { label: "正在搜索网页", icon: Globe2 },
];

export function SearchSkeleton() {
  return (
    <main className="min-h-screen bg-[#f6f8f5] text-[#17231f]" aria-busy="true" aria-live="polite">
      <SiteHeader compact />
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-4 sm:px-8 lg:px-10">
        <div className="h-16 animate-pulse rounded-[22px] border border-[#dde5e0] bg-white shadow-sm" />
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <span className="mx-auto block size-10 animate-pulse rounded-2xl bg-[#dbeae3]" />
          <h1 className="mt-5 text-2xl font-black tracking-[-0.03em]">正在寻找最适合你的学习资源…</h1>
          <p className="mt-2 text-sm text-[#748079]">多个资源通道正在并行工作，请稍候</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loadingSources.map(({ label, icon: Icon }, index) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#dfe6e2] bg-white px-4 py-3.5 shadow-sm">
              <span className="grid size-8 place-items-center rounded-xl bg-[#edf5f1] text-[#2c725e]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-bold text-[#64716b]">{label}</span>
              <span className="ml-auto flex gap-0.5" aria-hidden="true">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="loading-dot size-1 rounded-full bg-[#4f8a76]"
                    style={{ animationDelay: `${(index + dot) * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-[22px] border border-[#e1e7e3] bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
