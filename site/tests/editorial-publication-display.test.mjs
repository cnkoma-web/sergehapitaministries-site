import assert from "node:assert/strict";
import test from "node:test";
import { articleHref, formatArticleDate } from "../src/lib/content/articlePresentation.ts";

test("a date published at 23 h on the previous day retains its editorial day", () => {
  const previousTimezone = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  try {
    const article = {
      article_date: "2026-11-05",
      created_at: "2026-11-04T22:00:57Z",
    };
    assert.equal(formatArticleDate(article), "jeudi 5 novembre 2026");
    assert.equal(formatArticleDate(article, "short"), "5 nov.");
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test("article links pin the editorial day for daily categories and preserve article slugs", () => {
  const entry = { article_date: "2026-11-05", slug: "titre" };
  assert.equal(articleHref({ ...entry, type: "jc" }), "/publications/je-confesse-et-declare/2026-11-05");
  assert.equal(articleHref({ ...entry, type: "rm" }), "/rosee-matinale/2026-11-05");
  assert.equal(articleHref({ ...entry, type: "qdlb" }), "/publications/titre");
  assert.equal(articleHref({ ...entry, type: "vs" }), "/publications/titre");
});
