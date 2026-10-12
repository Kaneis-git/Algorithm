import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";

let app, upstream, base, logs = "", upstreamCalls = 0;
const repository = { name: "algorithms", full_name: "demo/algorithms", html_url: "https://github.com/demo/algorithms", description: "Algorithm tutorial", owner: { login: "demo" }, stargazers_count: 42, forks_count: 7, language: "TypeScript", topics: ["learning"], updated_at: "2026-01-01T00:00:00Z" };
before(async () => {
  upstream = createServer((req, res) => {
    upstreamCalls++;
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/chat/completions") {
      let body = ""; req.on("data", (d) => body += d); req.on("end", () => {
        const input = JSON.parse(body), data = JSON.parse(input.messages[1].content), q = data.query;
        if (q.includes("ai-failure")) { res.end(JSON.stringify({ choices: [{ message: { content: "broken JSON" }, finish_reason: "stop" }] })); return; }
        const content = data.resources ? { title: `${q} 学习概览`, overview: "根据检索摘要，先学习基础再实践。", coreKnowledge: ["基础概念"], relatedConcepts: ["算法"], learningPath: ["阅读资料", "动手实践"], sourceIds: [data.resources[0].id] } : { queries: [q, `${q} tutorial`, `${q} 入门`, `${q} 课程`] };
        res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) }, finish_reason: "stop" }] }));
      }); return;
    }
    if (req.url === "/web") {
      let body = ""; req.on("data", (d) => body += d); req.on("end", () => {
        const q = JSON.parse(body).query;
        const items = q.includes("empty-test") ? [] : q.includes("site:bilibili.com") ? [{ name: "Algorithm video", url: "https://www.bilibili.com/video/BV1234567890/?spm=tracking", snippet: "Video tutorial" }] : q.includes("filetype:") ? [{ name: "Algorithm slides", url: "https://example.edu/algorithm.pdf", snippet: "Course notes" }] : [{ name: "Algorithm handbook", url: "https://example.edu/algorithm?utm_source=test", snippet: "Learning guide", datePublished: "2026-01-01" }];
        res.end(JSON.stringify({ code: 200, data: { webPages: { value: items } } }));
      }); return;
    }
    const q = new URL(req.url, "http://localhost").searchParams.get("q") || "";
    if (q.includes("limit-test")) { res.writeHead(429); res.end('{"error":"SECRET_DO_NOT_LEAK"}'); return; }
    res.end(JSON.stringify({ items: q.includes("empty-test") ? [] : [repository], incomplete_results: false }));
  }).listen(0, "127.0.0.1");
  await once(upstream, "listening");
  const reservation = createServer().listen(0, "127.0.0.1"); await once(reservation, "listening");
  const port = reservation.address().port; await new Promise((resolve) => reservation.close(resolve));
  base = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, ["scripts/start.mjs"], { cwd: process.cwd(), env: { ...process.env, DATABASE_PATH: join(mkdtempSync(join(tmpdir(), "kh-http-")), "test.db"), PORT: String(port), APP_HOST: "127.0.0.1", GITHUB_ENABLED: "true", VIDEO_SEARCH_PROVIDER: "bilibili", EXPANSION_SEARCH_LIMIT: "2", SEARCH_CACHE_TTL_MINUTES: "60", SEARCH_RESULT_LIMIT: "8", GITHUB_API_URL: `http://127.0.0.1:${upstream.address().port}`, GITHUB_TOKEN: "test-only-secret", WEB_SEARCH_PROVIDER: "bocha", BOCHA_API_KEY: "test-only-secret", BOCHA_API_URL: `http://127.0.0.1:${upstream.address().port}/web`, TAVILY_API_KEY: "", AI_ENABLED: "true", AI_API_KEY: "test-only-secret", AI_BASE_URL: `http://127.0.0.1:${upstream.address().port}`, AI_MODEL: "fixture", YOUTUBE_API_KEY: "" }, stdio: ["ignore", "pipe", "pipe"] });
  app.stdout.on("data", (d) => logs += d); app.stderr.on("data", (d) => logs += d);
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error(logs);
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server failed to start: ${logs}`);
});
after(async () => { if (app && app.exitCode === null) { app.kill(); await once(app, "exit"); } if (upstream) await new Promise((resolve) => upstream.close(resolve)); });
const search = (query, extra = {}) => fetch(`${base}/api/search`, { method: "POST", headers: { "Content-Type": "application/json", ...extra }, body: JSON.stringify({ query }) });

test("production standalone starts and serves real mode", async () => { const r = await fetch(`${base}/api/health`); assert.equal((await r.json()).mode, "live"); });
test("home and assets load without remote font/CDN requirements", async () => { const html = await (await fetch(base)).text(); assert.match(html, /KnowledgeHub/); assert.equal(html.match(/Mock 资源模式|fonts.googleapis/)?.[0], undefined); const asset = html.match(/(?:href|src)="([^\"]*\/_next\/static\/[^\"]+)"/); assert.ok(asset); assert.equal((await fetch(`${base}${asset[1]}`)).status, 200); });
test("search handles Unicode, empty query and HTML escaping", async () => { assert.match(await (await fetch(`${base}/search`)).text(), /先输入一个学习主题/); assert.match(await (await fetch(`${base}/search?q=${encodeURIComponent("动态规划")}`)).text(), /动态规划/); const html = await (await fetch(`${base}/search?q=${encodeURIComponent('<script>alert(1)</script>')}`)).text(); assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/); });
test("search API maps genuine provider responses", async () => { const r = await search("algorithms"); assert.equal(r.status, 200); const d = await r.json(); assert.equal(d.isMock, false); assert.equal(d.results.github[0].stars, 42); assert.equal(d.results.github[0].url, repository.html_url); assert.equal(d.providers.github.status, "ok"); assert.doesNotMatch(JSON.stringify(d), /test-only-secret/); });
test("rate limits preserve structured partial results and hide upstream errors", async () => { const r = await search("limit-test"); const d = await r.json(); assert.equal(d.providers.github.status, "error"); assert.doesNotMatch(JSON.stringify(d), /SECRET_DO_NOT_LEAK/); });
test("empty result is a legitimate state", async () => { const d = await (await search("empty-test")).json(); assert.equal(d.providers.github.status, "empty"); });
test("API rejects invalid, oversized, non-JSON and cross-origin input", async () => { assert.equal((await search(" ")).status, 400); assert.equal((await search("x".repeat(81))).status, 400); assert.equal((await search("AI", { Origin: "https://evil.example" })).status, 403); assert.equal((await search("AI", { "Content-Type": "text/plain" })).status, 415); assert.equal((await search("x".repeat(21000))).status, 413); });
test("unknown routes return 404", async () => { assert.equal((await fetch(`${base}/missing-page`)).status, 404); });

test("web and presentation adapters integrate through production API", async () => {
  const d = await (await search("web-integration")).json();
  assert.equal(d.results.web[0].url, "https://example.edu/algorithm");
  assert.equal(d.results.ppts[0].fileType, "PDF");
  assert.equal(d.providers.web.status, "ok");
  assert.equal(d.providers.ppt.status, "ok");
});

test("video search produces direct Bilibili links without fabricated metadata", async () => {
 const d = await (await search("video-integration")).json();
 assert.equal(d.results.videos[0].url, "https://www.bilibili.com/video/BV1234567890/");
 assert.equal(d.results.videos[0].duration, "");
 assert.equal(d.results.videos[0].author, "");
 assert.equal(d.providers.video.status, "ok");
});

test("history/cache/favorites work through the production server", async () => {
 const first = await (await search("cache-check")).json();
 const second = await (await search("cache-check")).json();
 assert.equal(first.cache.hit, false); assert.equal(second.cache.hit, true);
 const history = await (await fetch(`${base}/api/history`)).json();
 assert.equal(history.history.find((r) => r.query === "cache-check").count, 2);
 const result = first.results.github[0];
 const save = () => fetch(`${base}/api/favorites`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result }) });
 assert.equal((await save()).status, 200); await save();
 const favorites = await (await fetch(`${base}/api/favorites`)).json(); assert.equal(favorites.favorites.length, 1);
 assert.equal((await fetch(`${base}/favorites`)).status, 200);
 const removal = await fetch(`${base}/api/favorites`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: result.id }) });
 assert.equal(removal.status, 200); assert.equal((await (await fetch(`${base}/api/favorites`)).json()).favorites.length, 0);
 const invalid = await fetch(`${base}/api/favorites`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ result: { ...result, url: "javascript:alert(1)" } }) });
 assert.equal(invalid.status, 400);
});

test("AI expansion, source-backed summary and graceful failure integrate end to end", async () => {
 const d = await (await search("ai-success")).json();
 assert.equal(d.expansion.mode, "ai"); assert.equal(d.usedQueries.length, 2); assert.equal(d.ai.status, "ok");
 const results = Object.values(d.results).flat();
 assert.ok(d.summary.citations.every((c) => results.some((r) => r.id === c.id && r.url === c.url)));
 const failed = await (await search("ai-failure")).json();
 assert.equal(failed.expansion.mode, "rules"); assert.equal(failed.ai.status, "error"); assert.equal(failed.summary, null); assert.equal(failed.providers.github.status, "ok");
 const settings = await (await fetch(`${base}/settings`)).text(); assert.match(settings, /服务配置/); assert.doesNotMatch(settings, /test-only-secret/);
});

test("concurrent identical searches share requests and refresh bypasses SQLite cache", async () => {
 const start = upstreamCalls;
 const [a, b] = await Promise.all([search("concurrent-check"), search("concurrent-check")]);
 assert.equal(a.status, 200); assert.equal(b.status, 200); await a.json(); await b.json();
 // 1 expansion + 2 queries × 4 sources + 1 summary.
 assert.equal(upstreamCalls - start, 10);
 const cached = await (await search("concurrent-check")).json(); assert.equal(cached.cache.hit, true); assert.equal(upstreamCalls - start, 10);
 const refreshed = await fetch(`${base}/api/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: "concurrent-check", refresh: true }) });
 assert.equal((await refreshed.json()).cache.hit, false); assert.equal(upstreamCalls - start, 20);
});
test("history deletion respects same-origin checks and persists empty state", async () => {
 const request = (origin) => fetch(`${base}/api/history`, { method: "DELETE", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify({ all: true }) });
 assert.equal((await request("https://evil.example")).status, 403);
 assert.equal((await request()).status, 200);
 assert.equal((await (await fetch(`${base}/api/history`)).json()).history.length, 0);
});
