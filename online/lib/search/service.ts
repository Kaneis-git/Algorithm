import "server-only";
import { cacheKey } from "./cache-key";
import { getStore } from "@/lib/db/index";
import { numberSetting, resultLimit } from "@/lib/config";
import { expandQuery } from "@/lib/ai/expandQuery";
import { summarize } from "@/lib/ai/summarize";
import { rankResults } from "@/lib/ai/rank";
import { aggregateSearch } from "./aggregate";
import type { SearchResponse } from "@/types/search";

export async function search(query: string, userId: string, refresh = false): Promise<SearchResponse> {
  const key = cacheKey(query, userId);
  const warnings: string[] = [];
  let response: SearchResponse | null = null;
  try { if (!refresh) response = await getStore(userId).cacheGet(key); }
  catch { warnings.push("缓存暂不可用，请稍后重试或检查云端数据库状态。搜索仍可继续。"); }
  if (response) response = { ...response, query, cache: { hit: true } };
  else {
    // Worker I/O stays within the current request; only completed results are shared through D1.
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
    if (result.ai?.status !== "error" && !Object.entries(result.errors).some(([type]) => !["unconfigured", "disabled"].includes(result.providers[type as keyof typeof result.providers].status)) && Object.values(result.providers).some((p) => ["ok", "empty"].includes(p.status))) {
      try { await getStore(userId).cachePut(key, result, numberSetting("SEARCH_CACHE_TTL_MINUTES", 60, 0, 1440) * 60000); }
      catch { result.warnings = ["搜索成功，但缓存未保存，请稍后重试或检查云端数据库状态。"]; }
    }
    response = { ...result, cache: { hit: false } };
  }
  try { await getStore(userId).recordSearch(query); }
  catch { warnings.push("搜索历史未保存，请稍后重试或检查云端数据库状态。"); }
  response.warnings = [...new Set([...(response.warnings || []), ...warnings])];
  return response;
}
