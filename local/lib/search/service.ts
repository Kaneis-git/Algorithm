import "server-only";
import { createHash } from "node:crypto";
import { getStore } from "@/lib/db/store";
import { numberSetting, resultLimit } from "@/lib/config";
import { expandQuery } from "@/lib/ai/expandQuery";
import { summarize } from "@/lib/ai/summarize";
import { rankResults } from "@/lib/ai/rank";
import { aggregateSearch } from "./aggregate";
import type { SearchResponse } from "@/types/search";

const inFlight = new Map<string, Promise<SearchResponse>>();
export function cacheKey(query: string) {
  // Changes to credentials/config invalidate old "not configured" results.
  const config = ["GITHUB_ENABLED", "GITHUB_API_URL", "GITHUB_TOKEN", "WEB_SEARCH_PROVIDER", "BOCHA_API_URL", "BOCHA_API_KEY", "TAVILY_API_URL", "TAVILY_API_KEY", "VIDEO_SEARCH_PROVIDER", "YOUTUBE_API_URL", "YOUTUBE_API_KEY", "SEARCH_RESULT_LIMIT", "AI_ENABLED", "AI_BASE_URL", "AI_API_KEY", "AI_MODEL", "AI_ALLOW_NO_KEY", "EXPANSION_SEARCH_LIMIT"].map((key) => process.env[key] || "");
  return createHash("sha256").update(JSON.stringify(["phase6-v1", query.toLocaleLowerCase(), config])).digest("hex");
}
export async function search(query: string, refresh = false): Promise<SearchResponse> {
  const key = cacheKey(query);
  const warnings: string[] = [];
  let response: SearchResponse | null = null;
  try { if (!refresh) response = getStore().cacheGet(key); }
  catch { warnings.push("缓存暂不可用，请检查 data 目录写入权限。搜索仍可继续。"); }
  if (response) response = { ...response, query, cache: { hit: true } };
  else {
    let task = inFlight.get(key);
    if (!task) {
      if (inFlight.size >= 8) throw new Error("Too many active searches");
      task = (async () => {
        const expansion = await expandQuery(query);
        const usedQueries = expansion.queries.slice(0, numberSetting("EXPANSION_SEARCH_LIMIT", 2, 1, 3));
        const result = await aggregateSearch(query, undefined, usedQueries);
        result.results = rankResults(result.results, query, expansion.queries);
        result.results.github = result.results.github.slice(0, resultLimit());
        result.results.web = result.results.web.slice(0, resultLimit());
        result.results.ppts = result.results.ppts.slice(0, resultLimit());
        result.results.videos = result.results.videos.slice(0, resultLimit());
        result.providers.github.count = result.results.github.length;
        result.providers.web.count = result.results.web.length;
        result.providers.ppt.count = result.results.ppts.length;
        result.providers.video.count = result.results.videos.length;
        result.expansion = expansion; result.usedQueries = usedQueries;
        const summary = await summarize(query, result.results);
        result.summary = summary.summary; result.ai = summary.ai;
        return result;
      })().then((result) => {
        if (result.ai?.status !== "error" && !Object.entries(result.errors).some(([type]) => !["unconfigured", "disabled"].includes(result.providers[type as keyof typeof result.providers].status)) && Object.values(result.providers).some((p) => ["ok", "empty"].includes(p.status))) {
          try { getStore().cachePut(key, result, numberSetting("SEARCH_CACHE_TTL_MINUTES", 60, 0, 1440) * 60000); }
          catch { result.warnings = ["搜索成功，但缓存未保存，请检查 data 目录写入权限。"]; }
        }
        return result;
      }).finally(() => inFlight.delete(key));
      inFlight.set(key, task);
    }
    response = { ...structuredClone(await task), cache: { hit: false } };
  }
  try { getStore().recordSearch(query); }
  catch { warnings.push("搜索历史未保存，请检查 data 目录写入权限。"); }
  response.warnings = [...new Set([...(response.warnings || []), ...warnings])];
  return response;
}
