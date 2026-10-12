import { test } from "node:test";
import assert from "node:assert/strict";
import { ruleExpansion, expandQuery } from "../lib/ai/expandQuery";
import { validateSummary } from "../lib/ai/summarize";
import { scoreResult, rankResults } from "../lib/ai/rank";
import { aggregateSearch, type SearchProviders } from "../lib/search/aggregate";
import { ServiceError } from "../lib/search/errors";
import { cacheKey } from "../lib/search/service";
import type { WebSearchResult } from "../types/search";
const row: WebSearchResult = { id: "web_example", type: "web", url: "https://docs.example.com/ai", title: "动态规划入门", description: "算法教程", source: "Example", domain: "docs.example.com", publishedAt: "2026-01-01", relevanceScore: 0 };
test("unconfigured AI falls back to explicitly labelled rule expansion", async () => {
  const old = process.env.AI_ENABLED; process.env.AI_ENABLED = "false";
  try { const r = await expandQuery("动态规划"); assert.equal(r.mode, "rules"); assert.equal(r.queries[0], "动态规划"); assert.ok(r.queries.length >= 4); }
  finally { if (old === undefined) delete process.env.AI_ENABLED; else process.env.AI_ENABLED = old; }
  assert.ok(ruleExpansion("x".repeat(80)).every((q) => q.length <= 80));
});
test("AI cannot cite unknown source IDs or invent links", () => {
  const summary = { title: "学习地图", overview: "概览", coreKnowledge: ["基础"], relatedConcepts: ["算法"], learningPath: ["阅读"], sourceIds: [row.id] };
  assert.equal(validateSummary(summary, [row]).citations[0].url, row.url);
  assert.throws(() => validateSummary({ ...summary, sourceIds: ["invented"] }, [row]));
});
test("ranking supports Chinese and keeps unrelated popular results below relevant content", () => {
  assert.ok(scoreResult(row, "动态规划") > scoreResult({ ...row, title: "烘焙课程", description: "面包" }, "动态规划"));
  const unrelated = { ...row, type: "github" as const, repositoryName: "bread", owner: "demo", stars: 1000000, forks: 9, language: "JS", topics: [], updatedAt: "2026-01-01", title: "Bread", description: "Cooking" };
  assert.equal(scoreResult(unrelated, "动态规划"), 0);
  assert.equal(rankResults({ github: [], videos: [], ppts: [], web: [row] }, "动态规划").web[0].relevanceScore > 0, true);
});
test("expanded queries really reach providers, deduplicate and retain original on partial failure", async () => {
  const seen: string[] = [];
  const provider = async (query: string) => { seen.push(query); if (query === "expanded") throw new ServiceError("timeout", "超时"); return [row]; };
  const adapters: SearchProviders = { web: provider, github: async () => [], video: async () => [], ppt: async () => [] };
  const r = await aggregateSearch("original", adapters, ["original", "expanded"]);
  assert.deepEqual(seen, ["original", "expanded"]); assert.equal(r.results.web.length, 1); assert.equal(r.providers.web.status, "ok"); assert.match(r.errors.web!, /部分扩展查询失败/);
});
test("provider configuration changes invalidate cached search keys without exposing credentials", () => {
  const old = process.env.BOCHA_API_KEY; const first = cacheKey("AI"); process.env.BOCHA_API_KEY = "test-config-changed";
  try { const second = cacheKey("AI"); assert.notEqual(first, second); assert.doesNotMatch(second, /test-config/); }
  finally { if (old === undefined) delete process.env.BOCHA_API_KEY; else process.env.BOCHA_API_KEY = old; }
});
