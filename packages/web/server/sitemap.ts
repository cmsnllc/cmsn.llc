import { Hono } from "hono";
import { articles, fixedPages, fixedPathOf, LANGS, newsLastmod, newsPathOf, pathOf, SITE } from "../content";
import type { Bindings } from "./types";

const TOP_LASTMOD = "2026-10-22";

export const sitemap = new Hono<{ Bindings: Bindings }>();

sitemap.get("/sitemap.xml", (c) => {
  const urls = [
    { loc: `${SITE}/`, lastmod: TOP_LASTMOD },
    ...fixedPages.map((p) => ({ loc: `${SITE}${fixedPathOf(p)}`, lastmod: p.updated || TOP_LASTMOD })),
    ...LANGS.map((l) => ({ loc: `${SITE}${newsPathOf(l)}`, lastmod: newsLastmod(l) || TOP_LASTMOD })),
    ...articles.map((a) => ({ loc: `${SITE}${pathOf(a)}`, lastmod: a.updated || a.date || TOP_LASTMOD })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
  return c.body(xml, 200, { "Content-Type": "application/xml; charset=utf-8" });
});
