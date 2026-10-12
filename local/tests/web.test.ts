import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBocha, parseTavily } from "../lib/search/providers/web";
import { presentationType } from "../lib/search/providers/ppt";

test("Bocha accepts documented direct and envelope result formats", () => {
  const data = { webPages: { value: [{ name: "AI", url: "https://example.com", summary: "intro" }, { wrong: true }] } };
  assert.equal(parseBocha(data).length, 1);
  assert.equal(parseBocha({ code: 200, data })[0].summary, "intro");
  assert.throws(() => parseBocha({ code: 401, data: null }));
  assert.throws(() => parseBocha({ error: "private diagnostic" }));
});
test("Tavily normalizes content and rejects malformed envelopes", () => {
  assert.equal(parseTavily({ results: [{ title: "AI", url: "https://example.com", content: "text" }] })[0].snippet, "text");
  assert.throws(() => parseTavily({ results: "bad" }));
});
test("PPT classification uses URL evidence, not arbitrary words in title", () => {
  assert.equal(presentationType("https://example.com/AI.PPTX?download=1"), "PPTX");
  assert.equal(presentationType("https://example.com/a.ppt"), "PPT");
  assert.equal(presentationType("https://example.com/a.pdf"), "PDF");
  assert.equal(presentationType("https://speakerdeck.com/user/slides"), "SLIDES");
  assert.equal(presentationType("https://example.com/a.pptx.exe"), null);
  assert.equal(presentationType("https://speakerdeck.com.evil.test/a"), null);
});
