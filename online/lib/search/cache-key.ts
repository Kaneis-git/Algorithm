import "server-only";
import { createHash } from "node:crypto";
export function cacheKey(query: string, userId: string) {
  // Changes to credentials/config invalidate old "not configured" results.
  const config = ["GITHUB_ENABLED", "GITHUB_API_URL", "GITHUB_TOKEN", "WEB_SEARCH_PROVIDER", "BOCHA_API_URL", "BOCHA_API_KEY", "TAVILY_API_URL", "TAVILY_API_KEY", "VIDEO_SEARCH_PROVIDER", "YOUTUBE_API_URL", "YOUTUBE_API_KEY", "SEARCH_RESULT_LIMIT", "AI_ENABLED", "AI_BASE_URL", "AI_API_KEY", "AI_MODEL", "AI_ALLOW_NO_KEY", "EXPANSION_SEARCH_LIMIT"].map((key) => process.env[key] || "");
  return createHash("sha256").update(JSON.stringify(["online-phase6-v1", userId, query.toLowerCase(), config])).digest("hex");
}
