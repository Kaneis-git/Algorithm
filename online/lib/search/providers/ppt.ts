import "server-only";
import { searchWeb } from "./web";
import { deduplicate, resultId } from "../normalize";
import type { PptSearchResult, WebSearchResult } from "@/types/search";

export function presentationType(value: string): PptSearchResult["fileType"] | null {
  const url = new URL(value);
  const path = url.pathname.toLowerCase();
  if (/\.pptx?$/.test(path)) return path.endsWith(".pptx") ? "PPTX" : "PPT";
  if (/\.pdf$/.test(path)) return "PDF";
  if ((url.hostname === "docs.google.com" && path.startsWith("/presentation/")) || /(^|\.)(slideshare\.net|speakerdeck\.com)$/.test(url.hostname)) return "SLIDES";
  return null;
}
export function asPresentations(rows: WebSearchResult[]): PptSearchResult[] {
  return deduplicate(rows.flatMap((r): PptSearchResult[] => {
    const fileType = presentationType(r.url);
    return fileType ? [{ id: resultId("ppt", r.url), type: "ppt", title: r.title, description: r.description, url: r.url, source: r.source, relevanceScore: 0, fileType, domain: r.domain }] : [];
  }));
}
export async function searchPpt(query: string): Promise<PptSearchResult[]> {
  return asPresentations(await searchWeb(`${query} (filetype:ppt OR filetype:pptx OR filetype:pdf OR site:slideshare.net OR site:speakerdeck.com)`));
}
