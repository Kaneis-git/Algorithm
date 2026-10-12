import "server-only";
import { z } from "zod";
import { endpoint, resultLimit } from "@/lib/config";
import { fetchJson } from "../http";
import { ServiceError } from "../errors";
import { dateLabel, deduplicate, plainText, resultId, safeUrl } from "../normalize";
import type { WebSearchResult } from "@/types/search";

const rowSchema = z.object({ name: z.string(), url: z.string(), snippet: z.string().nullish(), summary: z.string().nullish(), siteName: z.string().nullish(), datePublished: z.string().nullish() });
const bochaData = z.object({ webPages: z.object({ value: z.array(z.unknown()) }).nullish() });
const bochaEnvelope = z.object({ code: z.union([z.number(), z.string()]), data: bochaData.nullish() });
const tavilyData = z.object({ results: z.array(z.unknown()) });
const tavilyRow = z.object({ title: z.string(), url: z.string(), content: z.string().nullish(), published_date: z.string().nullish() });
type RawRow = z.infer<typeof rowSchema>;

export function parseBocha(value: unknown): RawRow[] {
  const envelope = bochaEnvelope.safeParse(value);
  let data: unknown = value;
  if (envelope.success) {
    if (String(envelope.data.code) !== "200") throw new ServiceError("network", "博查请求未成功，请检查 API Key、余额或服务状态。");
    data = envelope.data.data;
  }
  const parsed = bochaData.safeParse(data);
  if (!parsed.success) throw new ServiceError("invalid_response", "博查搜索响应格式无效。");
  // A response must declare its result set; do not mistake an error object for [] .
  if (!data || typeof data !== "object" || !("webPages" in data)) throw new ServiceError("invalid_response", "博查搜索响应缺少结果字段。");
  return (parsed.data.webPages?.value || []).flatMap((row) => { const r = rowSchema.safeParse(row); return r.success ? [r.data] : []; });
}
export function parseTavily(value: unknown): RawRow[] {
  const parsed = tavilyData.safeParse(value);
  if (!parsed.success) throw new ServiceError("invalid_response", "Tavily 搜索响应格式无效。");
  return parsed.data.results.flatMap((row) => { const r = tavilyRow.safeParse(row); return r.success ? [{ name: r.data.title, url: r.data.url, snippet: r.data.content, datePublished: r.data.published_date }] : []; });
}
export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  const provider = process.env.WEB_SEARCH_PROVIDER || "bocha";
  if (provider === "none") throw new ServiceError("disabled", "网页搜索已关闭。");
  if (!["bocha", "tavily"].includes(provider)) throw new ServiceError("config", "WEB_SEARCH_PROVIDER 仅支持 bocha、tavily 或 none。");
  const key = provider === "bocha" ? process.env.BOCHA_API_KEY : process.env.TAVILY_API_KEY;
  if (!key) throw new ServiceError("unconfigured", `请在站点运行配置中填写 ${provider === "bocha" ? "BOCHA_API_KEY" : "TAVILY_API_KEY"} 后重新发布。`);
  const url = endpoint(provider === "bocha" ? process.env.BOCHA_API_URL || "https://api.bochaai.com/v1/web-search" : process.env.TAVILY_API_URL || "https://api.tavily.com/search");
  const body = provider === "bocha" ? { query, summary: true, count: resultLimit(), freshness: "noLimit" } : { query, max_results: resultLimit(), search_depth: "basic", include_answer: false, include_raw_content: false };
  const raw = await fetchJson(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const rows = provider === "bocha" ? parseBocha(raw) : parseTavily(raw);
  return deduplicate(rows.flatMap((row): WebSearchResult[] => {
    const url = safeUrl(row.url), title = plainText(row.name, 300);
    if (!url || !title) return [];
    const domain = new URL(url).hostname;
    return [{ id: resultId("web", url), type: "web", title, description: plainText(row.summary || row.snippet) || "该网页未提供摘要。", url, source: plainText(row.siteName, 100) || domain, domain, publishedAt: dateLabel(row.datePublished), relevanceScore: 0 }];
  }));
}
