export type SearchResultType = "video" | "ppt" | "github" | "web";

export type SearchTab = "all" | SearchResultType;

interface BaseSearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  source: string;
  relevanceScore: number;
}

export interface VideoSearchResult extends BaseSearchResult {
  type: "video";
  author: string;
  publishedAt: string;
  duration: string;
  thumbnailLabel: string;
}

export interface PptSearchResult extends BaseSearchResult {
  type: "ppt";
  fileType: "PPT" | "PPTX" | "PDF" | "SLIDES";
  domain: string;
}

export interface GithubSearchResult extends BaseSearchResult {
  type: "github";
  repositoryName: string;
  owner: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  updatedAt: string;
}

export interface WebSearchResult extends BaseSearchResult {
  type: "web";
  domain: string;
  publishedAt: string;
}

export type SearchResult =
  | VideoSearchResult
  | PptSearchResult
  | GithubSearchResult
  | WebSearchResult;

export interface SearchResultGroups {
  videos: VideoSearchResult[];
  ppts: PptSearchResult[];
  github: GithubSearchResult[];
  web: WebSearchResult[];
}

export interface AISummaryData {
  title: string;
  overview: string;
  coreKnowledge: string[];
  relatedConcepts: string[];
  learningPath: string[];
  citations: { id: string; title: string; url: string }[];
}

export interface SearchResponse {
  query: string;
  summary: AISummaryData | null;
  results: SearchResultGroups;
  errors: Partial<Record<SearchResultType, string>>;
  isMock: false;
  providers: Record<SearchResultType, ProviderStatus>;
  searchedAt: string;
  cache?: { hit: boolean };
  expansion?: QueryExpansion;
  usedQueries?: string[];
  ai?: AIStatus;
  warnings?: string[];
}

export interface RecentSearch {
  query: string;
  category: string;
  timeLabel: string;
}

export interface ProviderStatus {
  status: "ok" | "empty" | "unconfigured" | "disabled" | "error";
  count: number;
  message?: string;
}

export interface HistoryEntry { query: string; searchedAt: string; count: number; }
export interface Favorite { result: SearchResult; createdAt: string; }

export interface QueryExpansion { mode: "ai" | "rules"; queries: string[]; message?: string; }
export interface AIStatus { status: "ok" | "empty" | "unconfigured" | "disabled" | "error"; message: string; }
