import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { marked } from "marked";

const SITE = "https://cmsn.llc";
const STATIC_DIR = "docs";
const PAGES_DIR = "pages";
const OUT_DIR = "dist";

type FrontMatter = Record<string, string>;

const LANGS = ["ja", "en"] as const;
type Lang = (typeof LANGS)[number];
const DEFAULT_LANG: Lang = "ja";

interface Page {
  id: string;
  lang: Lang;
  title: string;
  description?: string;
  date?: string;
  updated?: string;
  content: string;
}

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

function parseFrontMatter(src: string): { data: FrontMatter; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data: FrontMatter = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: src.slice(m[0].length) };
}

function render(layout: string, vars: Record<string, string>): string {
  return layout.replace(/\{\{\s*(\{?)\s*(\w+)\s*\}?\s*\}\}/g, (_, raw: string, key: string) =>
    raw ? (vars[key] ?? "") : escapeHtml(vars[key] ?? ""),
  );
}

const pathOf = (p: Pick<Page, "id" | "lang">): string =>
  `${p.lang === DEFAULT_LANG ? "" : `/${p.lang}`}/p/${p.id}/`;

async function loadPages(): Promise<Page[]> {
  const files = (await readdir(PAGES_DIR).catch(() => [] as string[])).filter(
    (f) => f.endsWith(".md") && !f.startsWith("_"),
  );
  const pages: Page[] = [];
  for (const file of files) {
    const m = basename(file, ".md").match(/^([1-9][0-9]*)\.([a-z]+)$/);
    if (!m || !(LANGS as readonly string[]).includes(m[2]))
      throw new Error(`${file}: ファイル名は <連番>.<${LANGS.join("|")}>.md`);
    const { data, body } = parseFrontMatter(await readFile(join(PAGES_DIR, file), "utf8"));
    if (data.draft === "true") continue;
    if (!data.title) throw new Error(`${file}: front matter に title がない`);
    pages.push({
      id: m[1],
      lang: m[2] as Lang,
      title: data.title,
      description: data.description,
      date: data.date,
      updated: data.updated,
      content: await marked.parse(body),
    });
  }
  return pages.sort(
    (a, b) => a.id.localeCompare(b.id, "en", { numeric: true }) || LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang),
  );
}

function sitemap(pages: Page[], today: string): string {
  const urls = [{ loc: `${SITE}/`, lastmod: "2022-05-19" }].concat(
    pages.map((p) => ({ loc: `${SITE}${pathOf(p)}`, lastmod: p.updated || p.date || today })),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}

function alternates(siblings: Page[]): string {
  if (siblings.length < 2) return "";
  const links = siblings.map((s) => `<link rel="alternate" hreflang="${s.lang}" href="${SITE}${pathOf(s)}">`);
  const def = siblings.find((s) => s.lang === DEFAULT_LANG);
  if (def) links.push(`<link rel="alternate" hreflang="x-default" href="${SITE}${pathOf(def)}">`);
  return links.join("\n  ");
}

function langSwitch(page: Page, siblings: Page[]): string {
  if (siblings.length < 2) return "";
  return siblings
    .map((s) =>
      s.lang === page.lang
        ? `<span aria-current="page">${s.lang.toUpperCase()}</span>`
        : `<a class="underline" href="${pathOf(s)}" hreflang="${s.lang}" lang="${s.lang}">${s.lang.toUpperCase()}</a>`,
    )
    .join(" / ");
}

const today = new Date().toISOString().slice(0, 10);
await rm(OUT_DIR, { recursive: true, force: true });
await cp(STATIC_DIR, OUT_DIR, { recursive: true });

const layout = await readFile("layouts/page.html", "utf8");
const pages = await loadPages();
for (const p of pages) {
  const siblings = pages.filter((s) => s.id === p.id);
  const dir = join(OUT_DIR, pathOf(p));
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "index.html"),
    render(layout, {
      lang: p.lang,
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      date: p.date ?? "",
      url: `${SITE}${pathOf(p)}`,
      alternates: alternates(siblings),
      langSwitch: langSwitch(p, siblings),
      content: p.content,
    }),
  );
}
await writeFile(join(OUT_DIR, "sitemap.xml"), sitemap(pages, today));
console.log(`built ${pages.length} page(s) → ${OUT_DIR}/`);
