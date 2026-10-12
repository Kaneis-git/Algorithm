import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Brand } from "@/components/brand/Brand";

interface SiteHeaderProps {
  compact?: boolean;
}

export function SiteHeader({ compact = false }: SiteHeaderProps) {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Brand compact={compact} />
      <nav aria-label="主导航" className="ml-auto mr-3 flex gap-3 text-xs font-bold text-emerald-800"><Link href="/">搜索</Link><Link href="/favorites">收藏</Link><Link href="/settings">配置</Link></nav>
      <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#dce5df] bg-white/75 px-3 py-2 text-[11px] font-bold text-[#596862] shadow-sm backdrop-blur-md sm:text-xs">
        <span className="grid size-5 place-items-center rounded-full bg-[#e5f5e9] text-[#187057]">
          <Sparkles className="size-3" aria-hidden="true" />
        </span>
        <span>本机学习资源库</span>
      </div>
    </header>
  );
}
