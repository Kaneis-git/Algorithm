import "server-only";
import { resultSchema } from "@/lib/search/schemas";
import { resultId, safeUrl } from "@/lib/search/normalize";
import type { Favorite, HistoryEntry, SearchResponse, SearchResult } from "@/types/search";

/** D1-backed storage. Every statement is scoped to the authenticated visitor. */
export class Store {
  constructor(private db: D1Database, private userId: string) {
    if (!userId) throw new Error("Authenticated user is required");
  }
  async recordSearch(query: string, now = Date.now()) {
    await this.db.batch([
      this.db.prepare(`INSERT INTO SearchHistory(user_id,query_key,query,searched_at,count) VALUES(?,?,?,?,1)
        ON CONFLICT(user_id,query_key) DO UPDATE SET query=excluded.query,searched_at=excluded.searched_at,count=SearchHistory.count+1`).bind(this.userId, query.toLowerCase(), query, now),
      this.db.prepare("DELETE FROM SearchHistory WHERE user_id=? AND query_key NOT IN (SELECT query_key FROM SearchHistory WHERE user_id=? ORDER BY searched_at DESC LIMIT 100)").bind(this.userId, this.userId),
    ]);
  }
  async history(): Promise<HistoryEntry[]> {
    const rows = await this.db.prepare("SELECT query,searched_at,count FROM SearchHistory WHERE user_id=? ORDER BY searched_at DESC,query_key LIMIT 100").bind(this.userId).all<{ query: string; searched_at: number; count: number }>();
    return rows.results.map((r) => ({ query: r.query, searchedAt: new Date(r.searched_at).toISOString(), count: r.count }));
  }
  async clearHistory() { await this.db.prepare("DELETE FROM SearchHistory WHERE user_id=?").bind(this.userId).run(); }
  async favorites(): Promise<Favorite[]> {
    const rows = await this.db.prepare("SELECT payload,created_at FROM Favorite WHERE user_id=? ORDER BY created_at DESC,id").bind(this.userId).all<{ payload: string; created_at: number }>();
    return rows.results.flatMap((r) => {
      try { return [{ result: resultSchema.parse(JSON.parse(r.payload)), createdAt: new Date(r.created_at).toISOString() }]; } catch { return []; }
    });
  }
  async addFavorite(result: SearchResult, now = Date.now()): Promise<Favorite> {
    const row = resultSchema.parse(result);
    row.url = safeUrl(row.url)!; row.id = resultId(row.type, row.url);
    await this.db.prepare(`INSERT INTO Favorite(user_id,id,url,type,payload,created_at) VALUES(?,?,?,?,?,?)
      ON CONFLICT(user_id,url) DO UPDATE SET id=excluded.id,type=excluded.type,payload=excluded.payload`).bind(this.userId, row.id, row.url, row.type, JSON.stringify(row), now).run();
    const saved = await this.db.prepare("SELECT created_at FROM Favorite WHERE user_id=? AND url=?").bind(this.userId, row.url).first<{ created_at: number }>();
    return { result: row, createdAt: new Date(saved?.created_at || now).toISOString() };
  }
  async removeFavorite(id: string) { await this.db.prepare("DELETE FROM Favorite WHERE user_id=? AND id=?").bind(this.userId, id).run(); }
  async cacheGet(key: string, now = Date.now()): Promise<SearchResponse | null> {
    const row = await this.db.prepare("SELECT payload,expires_at FROM SearchCache WHERE user_id=? AND key=?").bind(this.userId, key).first<{ payload: string; expires_at: number }>();
    if (!row) return null;
    if (row.expires_at <= now) { await this.removeCache(key); return null; }
    try {
      const data = JSON.parse(row.payload) as SearchResponse;
      if (data.isMock !== false || !data.providers || !data.results || !data.query) throw new Error();
      for (const items of [data.results.github, data.results.web, data.results.videos, data.results.ppts]) {
        if (!Array.isArray(items)) throw new Error();
        for (const item of items) resultSchema.parse(item);
      }
      return data;
    } catch { await this.removeCache(key); return null; }
  }
  private async removeCache(key: string) { await this.db.prepare("DELETE FROM SearchCache WHERE user_id=? AND key=?").bind(this.userId, key).run(); }
  async cachePut(key: string, response: SearchResponse, ttlMs: number, now = Date.now()) {
    if (ttlMs <= 0) return;
    await this.db.batch([
      this.db.prepare("INSERT INTO SearchCache(user_id,key,payload,expires_at,created_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET payload=excluded.payload,expires_at=excluded.expires_at,created_at=excluded.created_at").bind(this.userId, key, JSON.stringify(response), now + ttlMs, now),
      this.db.prepare("DELETE FROM SearchCache WHERE user_id=? AND expires_at<=?").bind(this.userId, now),
      this.db.prepare("DELETE FROM SearchCache WHERE user_id=? AND key NOT IN (SELECT key FROM SearchCache WHERE user_id=? ORDER BY created_at DESC LIMIT 100)").bind(this.userId, this.userId),
    ]);
  }
}
