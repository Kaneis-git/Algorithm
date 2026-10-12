import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { resultSchema } from "@/lib/search/schemas";
import { resultId, safeUrl } from "@/lib/search/normalize";
import type { Favorite, HistoryEntry, SearchResponse, SearchResult } from "@/types/search";

export class Store {
  private db: DatabaseSync;
  constructor(filename: string) {
    if (filename !== ":memory:") mkdirSync(dirname(resolve(filename)), { recursive: true });
    this.db = new DatabaseSync(filename, { timeout: 5000 });
    this.db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
    const version = Number(this.db.prepare("PRAGMA user_version").get()?.user_version || 0);
    if (version > 1) { this.db.close(); throw new Error("Database version is newer than this app"); }
    if (version === 0) {
      try {
        this.db.exec(`BEGIN IMMEDIATE;
          CREATE TABLE IF NOT EXISTS SearchHistory (queryKey TEXT PRIMARY KEY, query TEXT NOT NULL, searchedAt INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 1) STRICT;
          CREATE TABLE IF NOT EXISTS Favorite (id TEXT PRIMARY KEY, url TEXT NOT NULL UNIQUE, type TEXT NOT NULL, payload TEXT NOT NULL, createdAt INTEGER NOT NULL) STRICT;
          CREATE TABLE IF NOT EXISTS SearchCache (key TEXT PRIMARY KEY, payload TEXT NOT NULL, expiresAt INTEGER NOT NULL, createdAt INTEGER NOT NULL) STRICT;
          CREATE INDEX IF NOT EXISTS cache_expiry ON SearchCache(expiresAt);
          PRAGMA user_version=1; COMMIT;`);
      } catch (error) { this.db.exec("ROLLBACK"); this.db.close(); throw error; }
    }
  }
  close() { this.db.close(); }
  recordSearch(query: string, now = Date.now()) {
    this.db.prepare(`INSERT INTO SearchHistory(queryKey,query,searchedAt,count) VALUES(?,?,?,1)
      ON CONFLICT(queryKey) DO UPDATE SET query=excluded.query,searchedAt=excluded.searchedAt,count=SearchHistory.count+1`).run(query.toLocaleLowerCase(), query, now);
    this.db.exec("DELETE FROM SearchHistory WHERE queryKey NOT IN (SELECT queryKey FROM SearchHistory ORDER BY searchedAt DESC LIMIT 100)");
  }
  history(): HistoryEntry[] {
    return this.db.prepare("SELECT query,searchedAt,count FROM SearchHistory ORDER BY searchedAt DESC, rowid DESC LIMIT 100").all().map((r) => ({ query: String(r.query), searchedAt: new Date(Number(r.searchedAt)).toISOString(), count: Number(r.count) }));
  }
  clearHistory() { this.db.exec("DELETE FROM SearchHistory"); }
  favorites(): Favorite[] {
    return this.db.prepare("SELECT payload,createdAt FROM Favorite ORDER BY createdAt DESC,rowid DESC").all().flatMap((r) => {
      try { return [{ result: resultSchema.parse(JSON.parse(String(r.payload))), createdAt: new Date(Number(r.createdAt)).toISOString() }]; } catch { return []; }
    });
  }
  addFavorite(result: SearchResult, now = Date.now()): Favorite {
    const row = resultSchema.parse(result);
    row.url = safeUrl(row.url)!;
    row.id = resultId(row.type, row.url);
    // A URL identifies a bookmark across resource types. Preserve one row.
    this.db.prepare(`INSERT INTO Favorite(id,url,type,payload,createdAt) VALUES(?,?,?,?,?)
      ON CONFLICT(url) DO UPDATE SET id=excluded.id,type=excluded.type,payload=excluded.payload`).run(row.id, row.url, row.type, JSON.stringify(row), now);
    const saved = this.db.prepare("SELECT createdAt FROM Favorite WHERE url=?").get(row.url)!;
    return { result: row, createdAt: new Date(Number(saved.createdAt)).toISOString() };
  }
  removeFavorite(id: string) { this.db.prepare("DELETE FROM Favorite WHERE id=?").run(id); }
  cacheGet(key: string, now = Date.now()): SearchResponse | null {
    const row = this.db.prepare("SELECT payload,expiresAt FROM SearchCache WHERE key=?").get(key);
    if (!row) return null;
    if (Number(row.expiresAt) <= now) { this.db.prepare("DELETE FROM SearchCache WHERE key=?").run(key); return null; }
    try {
      const data = JSON.parse(String(row.payload)) as SearchResponse;
      if (data.isMock !== false || !data.providers || !data.results || !data.query) throw new Error();
      for (const items of Object.values(data.results)) for (const item of items) resultSchema.parse(item);
      return data;
    } catch { this.db.prepare("DELETE FROM SearchCache WHERE key=?").run(key); return null; }
  }
  cachePut(key: string, response: SearchResponse, ttlMs: number, now = Date.now()) {
    if (ttlMs <= 0) return;
    this.db.prepare("INSERT INTO SearchCache(key,payload,expiresAt,createdAt) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload,expiresAt=excluded.expiresAt,createdAt=excluded.createdAt").run(key, JSON.stringify(response), now + ttlMs, now);
    this.db.prepare("DELETE FROM SearchCache WHERE expiresAt<=?").run(now);
    this.db.exec("DELETE FROM SearchCache WHERE key NOT IN (SELECT key FROM SearchCache ORDER BY createdAt DESC LIMIT 100)");
  }
}
const globalStore = globalThis as typeof globalThis & { knowledgehubStore?: Store };
export function getStore(): Store {
  return globalStore.knowledgehubStore ||= new Store(resolve(process.env.DATABASE_PATH || "data/knowledgehub.db"));
}
