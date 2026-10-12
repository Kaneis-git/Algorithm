import { Waypoints } from "lucide-react";

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    // Full-page navigation keeps Vinext reliable in non-secure local previews.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a
      href="/"
      className="group inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4"
      aria-label="KnowledgeHub AI 首页"
    >
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#163f36] text-white shadow-[0_8px_24px_rgba(22,63,54,0.18)] transition-transform group-hover:-rotate-3">
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(190,242,100,0.7),transparent_36%)]" />
        <Waypoints className="relative size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-[15px] font-extrabold tracking-[-0.025em] text-[#14231f]">
          KnowledgeHub <span className="text-[#20705b]">AI</span>
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#7d8b85]">
            Learn with clarity
          </span>
        )}
      </span>
    </a>
  );
}
