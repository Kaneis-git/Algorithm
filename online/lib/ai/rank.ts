import type { SearchResult, SearchResultGroups } from "@/types/search";
const segmenter = new Intl.Segmenter("zh-CN", { granularity: "word" });
function tokens(value: string) { return [...segmenter.segment(value.toLocaleLowerCase())].filter((s) => s.isWordLike).map((s) => s.segment); }
function textMatch(query: string, result: SearchResult) {
  const terms = [...new Set(tokens(query))];
  if (!terms.length) return 0;
  const title = result.title.toLocaleLowerCase(), body = result.description.toLocaleLowerCase();
  return terms.reduce((score, term) => score + (title.includes(term) ? 52 : body.includes(term) ? 27 : 0), 0) / terms.length;
}
export function scoreResult(result: SearchResult, query: string, expanded: string[] = [], now = Date.now()) {
  const relevance = Math.max(textMatch(query, result), ...expanded.map((q) => textMatch(q, result) * 0.8));
  const host = new URL(result.url).hostname;
  const sourceQuality = /(^|\.)(edu|edu\.cn|ac\.uk)$/.test(host) || host.startsWith("docs.") || host.startsWith("developer.") ? 12 : 5;
  const popularity = result.type === "github" ? Math.min(8, Math.log10(result.stars + 1) * 1.6) : 0;
  const date = result.type === "github" ? result.updatedAt : "publishedAt" in result ? result.publishedAt : "";
  const age = now - Date.parse(date);
  const freshness = Number.isFinite(age) && age >= 0 ? Math.max(0, 5 - age / (365 * 24 * 3600 * 1000)) : 0;
  // Popularity/recency cannot rescue an unrelated title and description.
  return Math.max(0, Math.min(100, Math.round(relevance * 1.4 + (relevance > 0 ? sourceQuality + popularity + freshness : 0))));
}
export function rankResults(results: SearchResultGroups, query: string, expanded: string[] = []): SearchResultGroups {
  const rank = <T extends SearchResult>(rows: T[]) => rows.map((r) => ({ ...r, relevanceScore: scoreResult(r, query, expanded) })).sort((a, b) => b.relevanceScore - a.relevanceScore || a.id.localeCompare(b.id));
  return { github: rank(results.github), web: rank(results.web), ppts: rank(results.ppts), videos: rank(results.videos) };
}
