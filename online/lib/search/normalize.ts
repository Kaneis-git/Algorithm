import { createHash } from "node:crypto";
import type { SearchResult } from "@/types/search";

export function safeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|spm$|from$|gclid$|fbclid$)/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    return url.toString();
  } catch { return null; }
}

export function resultId(type: string, url: string) {
  return `${type}_${createHash("sha256").update(url).digest("hex").slice(0, 24)}`;
}

export function plainText(value: string | null | undefined, max = 1200) {
  return (value || "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim().slice(0, max);
}

export function dateLabel(value: string | null | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) return "日期未提供";
  return new Date(value).toISOString().slice(0, 10);
}

export function deduplicate<T extends SearchResult>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const url = safeUrl(item.url);
    if (!url || seen.has(url)) return false;
    seen.add(url);
    item.url = url;
    item.id = resultId(item.type, url);
    return true;
  });
}
