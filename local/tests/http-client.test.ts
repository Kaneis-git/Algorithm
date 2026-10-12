import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { fetchJson } from "../lib/search/http";
import { ServiceError } from "../lib/search/errors";

test("provider HTTP client rejects malformed, oversized, slow and redirected responses", async () => {
  const server = createServer((req, res) => {
    if (req.url === "/slow") return;
    if (req.url === "/large") return void res.end("x".repeat(2_000_001));
    if (req.url === "/redirect") { res.writeHead(302, { Location: "/secret" }); return void res.end(); }
    res.end("not-json");
  }).listen(0, "127.0.0.1");
  await once(server, "listening"); const address = server.address(); assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  try {
    await assert.rejects(fetchJson(`${base}/bad`), (e) => e instanceof ServiceError && e.code === "invalid_response");
    await assert.rejects(fetchJson(`${base}/large`), (e) => e instanceof ServiceError && e.code === "invalid_response");
    await assert.rejects(fetchJson(`${base}/slow`, {}, 100), (e) => e instanceof ServiceError && e.code === "timeout");
    await assert.rejects(fetchJson(`${base}/redirect`), (e) => e instanceof ServiceError && e.code === "network");
  } finally { server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});
