import { FileText, GitBranch, Globe2, LayoutGrid, Video } from "lucide-react";

import type { SearchTab } from "@/types/search";

interface SearchTabsProps {
  query: string;
  onChange?: (tab: SearchTab) => void;
  activeTab: SearchTab;
  counts: Record<SearchTab, number>;
}

const tabs = [
  { id: "all", label: "全部", icon: LayoutGrid },
  { id: "video", label: "视频", icon: Video },
  { id: "ppt", label: "PPT", icon: FileText },
  { id: "github", label: "GitHub", icon: GitBranch },
  { id: "web", label: "网页", icon: Globe2 },
] as const;

export function SearchTabs({ query, activeTab, counts, onChange }: SearchTabsProps) {
  return (
    <nav aria-label="搜索结果类型" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        const href = id === "all"
          ? `/search?q=${encodeURIComponent(query)}`
          : `/search?q=${encodeURIComponent(query)}&type=${id}`;

        return (
          <a
            key={id}
            href={href}
            onClick={onChange ? (event) => { event.preventDefault(); onChange(id); } : undefined}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-[#183f36] text-white shadow-[0_8px_22px_rgba(24,63,54,0.17)]"
                : "border border-[#dfe6e2] bg-white text-[#67756f] hover:border-[#b9c9c1] hover:text-[#173f36]"
            }`}
          >
            <Icon className="size-4" strokeWidth={2.2} aria-hidden="true" />
            <span>{label}</span>
            <span className={`text-[11px] ${isActive ? "text-[#bce9d7]" : "text-[#9aa6a1]"}`}>
              {counts[id]}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
