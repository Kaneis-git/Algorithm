import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Store } from "../lib/db/store";
import type { WebSearchResult, SearchResponse } from "../types/search";
const resource: WebSearchResult = { id: "untrusted", type: "web", url: "https://example.com/learn?utm_source=x", title: "SQL's guide", description: "Intro", source: "Example", domain: "example.com", publishedAt: "2026-01-01", relevanceScore: 50 };
test("SQLite history and favorites persist after close/reopen, with canonical deduplication", () => {
  const filename = join(mkdtempSync(join(tmpdir(), "kh-store-")), "store.db");
  let db = new Store(filename);
  db.recordSearch("SQL's guide", 10); db.recordSearch("SQL's guide", 20);
  const saved = db.addFavorite(resource, 10);
  db.addFavorite({ ...resource, url: "https://example.com/learn" }, 20);
  assert.equal(db.favorites().length, 1); assert.notEqual(saved.result.id, "untrusted");
  db.close(); db = new Store(filename);
  assert.equal(db.history()[0].count, 2); assert.equal(db.favorites().length, 1);
  db.removeFavorite(saved.result.id); assert.equal(db.favorites().length, 0);
  db.clearHistory(); assert.equal(db.history().length, 0); db.close();
});
test("SQLite cache expires and survives process-style reopen", () => {
  const filename = join(mkdtempSync(join(tmpdir(), "kh-cache-")), "store.db");
  let db = new Store(filename);
  const r: SearchResponse = { query: "AI", isMock: false, summary: null, results: { videos: [], ppts: [], github: [], web: [] }, errors: {}, providers: { github: { status: "empty", count: 0 }, web: { status: "empty", count: 0 }, ppt: { status: "empty", count: 0 }, video: { status: "empty", count: 0 } }, searchedAt: "2026-01-01" };
  db.cachePut("key", r, 100, 1000); db.close(); db = new Store(filename);
  assert.equal(db.cacheGet("key", 1099)?.query, "AI"); assert.equal(db.cacheGet("key", 1100), null); db.close();
});
