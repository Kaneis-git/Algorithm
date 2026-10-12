import { test } from "node:test";
import assert from "node:assert/strict";
import { bilibiliUrl, parseYoutube } from "../lib/search/providers/video";
test("Bilibili restricts domains and video paths, strips tracker parameters", () => {
  assert.equal(bilibiliUrl("https://m.bilibili.com/video/BV123abc/?spm=1"), "https://www.bilibili.com/video/BV123abc/");
  assert.equal(bilibiliUrl("https://bilibili.com.evil.test/video/BV123"), null);
  assert.equal(bilibiliUrl("https://search.bilibili.com/all?keyword=x"), null);
  assert.equal(bilibiliUrl("javascript:alert(1)"), null);
});
test("YouTube retains real channel/date metadata and rejects non-video records", () => {
  const rows = parseYoutube({ items: [{ id: { videoId: "abcDEF12345" }, snippet: { title: "A &amp; B", description: "intro", channelTitle: "Teacher", publishedAt: "2026-01-01" } }, { id: { channelId: "no" } }] });
  assert.equal(rows.length, 1); assert.equal(rows[0].title, "A & B"); assert.equal(rows[0].author, "Teacher"); assert.equal(rows[0].duration, "");
  assert.throws(() => parseYoutube({ error: "secret" }));
});
