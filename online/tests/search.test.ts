import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateSearch, type SearchProviders } from "../lib/search/aggregate";
import { ServiceError } from "../lib/search/errors";
import { safeUrl, plainText } from "../lib/search/normalize";
import { querySchema } from "../lib/api";

test("unsafe links are removed and trackers normalized", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(safeUrl("https://key:secret@example.com"), null);
  assert.equal(safeUrl("https://example.com/a?utm_source=x&b=2#a"), "https://example.com/a?b=2");
  assert.equal(plainText("<b>hello</b> &amp; world"), "hello & world");
});
test("search query validation normalizes Unicode and rejects empty/long input", () => {
  assert.equal(querySchema.parse("  ＡＩ   入门 "), "AI 入门");
  assert.equal(querySchema.safeParse("  ").success, false);
  assert.equal(querySchema.safeParse("x".repeat(81)).success, false);
});
test("one provider failure does not discard successful providers or leak raw errors", async () => {
  const adapters: SearchProviders = { github: async () => { throw new Error("secret-key"); }, web: async () => [], ppt: async () => { throw new ServiceError("unconfigured", "尚未配置"); }, video: async () => [] };
  const r = await aggregateSearch("AI", adapters);
  assert.equal(r.providers.github.status, "error");
  assert.equal(r.providers.web.status, "empty");
  assert.equal(r.providers.ppt.status, "unconfigured");
  assert.equal(JSON.stringify(r).includes("secret-key"), false);
  assert.equal(r.isMock, false);
});
