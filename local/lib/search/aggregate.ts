import "server-only";
import { deduplicate } from "./normalize";
import { searchVideo } from "./providers/video";
import { searchWeb } from "./providers/web";
import { searchPpt } from "./providers/ppt";
import { searchGithub } from "./providers/github";
import { publicError, ServiceError } from "./errors";
import type { SearchResponse, SearchResult, SearchResultType } from "@/types/search";

export type SearchProviders = Record<SearchResultType, (query: string) => Promise<SearchResult[]>>;
export const providers: SearchProviders = { github: searchGithub, web: searchWeb, ppt: searchPpt, video: searchVideo };

export async function aggregateSearch(query: string, adapters: SearchProviders = providers, queries: string[] = [query]): Promise<SearchResponse> {
  const types = ["github", "web", "ppt", "video"] as const;
  const outcomes = await Promise.allSettled(types.map(async (type) => {
    const variants = await Promise.allSettled(queries.map((q) => adapters[type](q)));
    const successful = variants.filter((v) => v.status === "fulfilled");
    if (!successful.length) throw variants.find((v) => v.status === "rejected")?.reason;
    const failures = variants.filter((v) => v.status === "rejected");
    return { rows: deduplicate(successful.flatMap((v) => v.value)), warning: failures.length ? `部分扩展查询失败：${publicError(failures[0].reason)}` : undefined };
  }));
  const response: SearchResponse = { query, isMock: false, summary: null, results: { github: [], web: [], ppts: [], videos: [] }, errors: {}, providers: {} as SearchResponse["providers"], searchedAt: new Date().toISOString() };
  outcomes.forEach((outcome, index) => {
    const type = types[index];
    if (outcome.status === "fulfilled") {
      const { rows, warning } = outcome.value;
      if (warning) response.errors[type] = warning;
      response.providers[type] = { status: rows.length ? "ok" : "empty", count: rows.length, message: warning };
      response.results.github.push(...rows.filter((r) => r.type === "github"));
      response.results.web.push(...rows.filter((r) => r.type === "web"));
      response.results.ppts.push(...rows.filter((r) => r.type === "ppt"));
      response.results.videos.push(...rows.filter((r) => r.type === "video"));
    } else {
      const error = outcome.reason;
      const status = error instanceof ServiceError && ["unconfigured", "disabled"].includes(error.code) ? error.code as "unconfigured" | "disabled" : "error";
      const message = publicError(error);
      response.errors[type] = message;
      response.providers[type] = { status, count: 0, message };
    }
  });
  return response;
}
