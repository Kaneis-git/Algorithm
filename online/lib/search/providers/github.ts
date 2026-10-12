import "server-only";
import { z } from "zod";
import { endpoint, resultLimit } from "@/lib/config";
import { fetchJson } from "../http";
import { ServiceError } from "../errors";
import { dateLabel, deduplicate, plainText, resultId, safeUrl } from "../normalize";
import type { GithubSearchResult } from "@/types/search";

const repository = z.object({
  name: z.string(), full_name: z.string(), html_url: z.string(),
  description: z.string().nullable().optional(), owner: z.object({ login: z.string() }),
  stargazers_count: z.number().nonnegative(), forks_count: z.number().nonnegative(),
  language: z.string().nullable(), topics: z.array(z.string()).optional(), updated_at: z.string(),
});
const responseSchema = z.object({ items: z.array(z.unknown()), incomplete_results: z.boolean().optional() });

export async function searchGithub(query: string): Promise<GithubSearchResult[]> {
  if (process.env.GITHUB_ENABLED === "false") throw new ServiceError("disabled", "GitHub 搜索已关闭。");
  const url = new URL(`${endpoint(process.env.GITHUB_API_URL || "https://api.github.com")}/search/repositories`);
  // Only public repositories, even when a token can access private content.
  url.searchParams.set("q", `${query} is:public`);
  url.searchParams.set("per_page", String(resultLimit()));
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2026-03-10", "User-Agent": "KnowledgeHub-AI" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const parsed = responseSchema.safeParse(await fetchJson(url.toString(), { headers }));
  if (!parsed.success) throw new ServiceError("invalid_response", "GitHub 响应格式无效。");
  if (parsed.data.incomplete_results) throw new ServiceError("timeout", "GitHub 搜索未完整返回，请稍后重试或缩小搜索范围。");
  const items = parsed.data.items.flatMap((value): GithubSearchResult[] => {
    const row = repository.safeParse(value);
    if (!row.success) return [];
    const r = row.data;
    const link = safeUrl(r.html_url);
    if (!link || new URL(link).hostname !== "github.com") return [];
    return [{ id: resultId("github", link), type: "github", title: plainText(r.full_name), repositoryName: plainText(r.name), owner: plainText(r.owner.login),
      description: plainText(r.description) || "该项目未提供简介。", url: link, source: "GitHub", relevanceScore: 0,
      stars: r.stargazers_count, forks: r.forks_count, language: r.language || "未标注", topics: (r.topics || []).slice(0, 12), updatedAt: dateLabel(r.updated_at) }];
  });
  return deduplicate(items);
}
