import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { Store } from "../lib/db/store";
import { requireUserId } from "../lib/auth";
import { cacheKey } from "../lib/search/cache-key";
import type { SearchResponse, WebSearchResult } from "../types/search";

// Exercise the generated migration SQL and the D1 statement contract against
// SQLite. This is not a substitute for Cloudflare production runtime testing.
function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync("drizzle").filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, "utf8"));
  function prepare(sql: string) {
    let args: (string | number | null)[] = [];
    const statement = {
      bind(...values: (string | number | null)[]) { args = values; return statement; },
      async run() { sqlite.prepare(sql).run(...args); return { success: true }; },
      async first() { return sqlite.prepare(sql).get(...args) || null; },
      async all() { return { results: sqlite.prepare(sql).all(...args), success: true }; },
    };
    return statement;
  }
  const db = { prepare, async batch(statements: { run(): Promise<unknown> }[]) {
    sqlite.exec("BEGIN");
    try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec("COMMIT"); return results; }
    catch (error) { sqlite.exec("ROLLBACK"); throw error; }
  } } as unknown as D1Database;
  return { db, close: () => sqlite.close() };
}
const resource: WebSearchResult = { id: "untrusted-id", type: "web", url: "https://example.com/guide?utm_source=one", title: "AI's guide", description: "Intro", source: "Example", domain: "example.com", publishedAt: "2026-01-01", relevanceScore: 50 };
const response: SearchResponse = { query: "AI", isMock: false, summary: null, results: { github: [], web: [], videos: [], ppts: [] }, errors: {}, providers: { github: { status: "empty", count: 0 }, web: { status: "empty", count: 0 }, video: { status: "empty", count: 0 }, ppt: { status: "empty", count: 0 } }, searchedAt: "2026-01-01" };

test("D1 history and favorites are isolated by authenticated user", async () => {
  const f = fixture();
  try {
    const a = new Store(f.db, "a"), b = new Store(f.db, "b");
    await a.recordSearch("AI's guide", 1); await b.recordSearch("private topic", 2); await a.recordSearch("AI's guide", 3);
    assert.equal((await a.history())[0].count, 2); assert.equal((await b.history())[0].query, "private topic");
    const saved = await a.addFavorite(resource); await a.addFavorite({ ...resource, url: "https://example.com/guide" });
    assert.equal((await a.favorites()).length, 1); assert.equal((await b.favorites()).length, 0);
    await b.removeFavorite(saved.result.id); assert.equal((await a.favorites()).length, 1);
    await b.addFavorite(resource); await a.removeFavorite(saved.result.id); assert.equal((await b.favorites()).length, 1);
    await a.clearHistory(); assert.equal((await a.history()).length, 0); assert.equal((await b.history()).length, 1);
  } finally { f.close(); }
});
test("D1 cache expiry and limits cannot delete another user's records", async () => {
  const f = fixture();
  try {
    const a = new Store(f.db, "a"), b = new Store(f.db, "b");
    await a.cachePut("same", response, 100, 1000); await b.cachePut("same", response, 1000, 1000);
    assert.equal((await a.cacheGet("same", 1099))?.query, "AI"); assert.equal(await a.cacheGet("same", 1100), null); assert.ok(await b.cacheGet("same", 1100));
    for (let i = 0; i < 102; i++) await a.recordSearch(`q-${i}`, i);
    assert.equal((await a.history()).length, 100); assert.ok(await b.cacheGet("same", 1100));
    assert.notEqual(cacheKey("AI", "a"), cacheKey("AI", "b"));
  } finally { f.close(); }
});
test("data APIs require the Sites-authenticated identity header", () => {
  assert.throws(() => requireUserId(new Request("https://example.test/api/history?userId=a")), /登录/);
  assert.equal(requireUserId(new Request("https://example.test/api/history", { headers: { "oai-authenticated-user-id": "a" } })), "a");
  assert.throws(() => new Store({} as D1Database, ""), /Authenticated/);
});
