import "server-only";
import { z } from "zod";
import { endpoint, resultLimit } from "@/lib/config";
import { fetchJson } from "../http";
import { ServiceError } from "../errors";
import { dateLabel, deduplicate, plainText, resultId } from "../normalize";
import { searchWeb } from "./web";
import type { VideoSearchResult, WebSearchResult } from "@/types/search";

export function bilibiliUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || !/(^|\.)bilibili\.com$/.test(url.hostname)) return null;
    const match = url.pathname.match(/^\/video\/(BV[a-zA-Z0-9]+|av\d+)\/?$/);
    if (!match) return null;
    return `https://www.bilibili.com/video/${match[1]}/`;
  } catch { return null; }
}
export function asBilibiliVideos(rows: WebSearchResult[]): VideoSearchResult[] {
  return deduplicate(rows.flatMap((r): VideoSearchResult[] => {
    const url = bilibiliUrl(r.url);
    if (!url) return [];
    return [{ id: resultId("video", url), type: "video", title: r.title, description: r.description, url, source: "哔哩哔哩 · 网页索引", relevanceScore: 0, author: "", duration: "", publishedAt: r.publishedAt, thumbnailLabel: "BILIBILI" }];
  }));
}
const youtubeSchema = z.object({ items: z.array(z.unknown()) });
const youtubeRow = z.object({ id: z.object({ videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/) }), snippet: z.object({ title: z.string(), description: z.string(), channelTitle: z.string(), publishedAt: z.string() }) });
export function parseYoutube(value: unknown): VideoSearchResult[] {
  const parsed = youtubeSchema.safeParse(value);
  if (!parsed.success) throw new ServiceError("invalid_response", "YouTube 响应格式无效。");
  return deduplicate(parsed.data.items.flatMap((value): VideoSearchResult[] => {
    const row = youtubeRow.safeParse(value);
    if (!row.success) return [];
    const r = row.data, url = `https://www.youtube.com/watch?v=${r.id.videoId}`;
    return [{ id: resultId("video", url), type: "video", title: plainText(r.snippet.title, 300), description: plainText(r.snippet.description), url, source: "YouTube", relevanceScore: 0, author: plainText(r.snippet.channelTitle), publishedAt: dateLabel(r.snippet.publishedAt), duration: "", thumbnailLabel: "YOUTUBE" }];
  }));
}
export async function searchVideo(query: string): Promise<VideoSearchResult[]> {
  const provider = process.env.VIDEO_SEARCH_PROVIDER || "bilibili";
  if (provider === "none") throw new ServiceError("disabled", "视频搜索已关闭。");
  if (provider === "bilibili") return asBilibiliVideos(await searchWeb(`${query} 视频教程 site:bilibili.com/video/`));
  if (provider !== "youtube") throw new ServiceError("config", "VIDEO_SEARCH_PROVIDER 仅支持 bilibili、youtube 或 none。");
  if (!process.env.YOUTUBE_API_KEY) throw new ServiceError("unconfigured", "请配置 YOUTUBE_API_KEY 后重启。");
  const url = new URL(`${endpoint(process.env.YOUTUBE_API_URL || "https://www.googleapis.com/youtube/v3")}/search`);
  url.searchParams.set("part", "snippet"); url.searchParams.set("type", "video"); url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(resultLimit())); url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  // No upstream URL or response body is included in client errors/logs.
  return parseYoutube(await fetchJson(url.toString()));
}
