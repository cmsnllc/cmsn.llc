import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, basename } from "node:path";
import { marked } from "marked";

const SITE = "https://cmsn.llc";
const STATIC_DIR = "docs";
const PAGES_DIR = "pages";
const OUT_DIR = "dist";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: src.slice(m[0].length) };
}

function render(layout, vars) {
  return layout.replace(/\{\{\s*(\{?)\s*(\w+)\s*\}?\s*\}\}/g, (_, raw, key) =>
    raw ? (vars[key] ?? "") : escapeHtml(vars[key] ?? ""),
  );
}

async function loadPages() {
  const files = (await readdir(PAGES_DIR).catch(() => [])).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  const pages = [];
  for (const file of files) {
    const slug = basename(file, ".md");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`${file}: ファイル名は英小文字・数字・ハイフンのみ`);
    const { data, body } = parseFrontMatter(await readFile(join(PAGES_DIR, file), "utf8"));
    if (data.draft === "true") continue;
    if (!data.title) throw new Error(`${file}: front matter に title がない`);
    pages.push({ slug, ...data, content: marked.parse(body) });
  }
  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

function sitemap(pages, today) {
  const urls = [{ loc: `${SITE}/`, lastmod: "2022-05-19" }].concat(
    pages.map((p) => ({ loc: `${SITE}/${p.slug}/`, lastmod: p.updated || p.date || today })),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n")}
</urlset>
`;
}

const today = new Date().toISOString().slice(0, 10);
await rm(OUT_DIR, { recursive: true, force: true });
await cp(STATIC_DIR, OUT_DIR, { recursive: true });

const layout = await readFile("layouts/page.html", "utf8");
const pages = await loadPages();
for (const p of pages) {
  const dir = join(OUT_DIR, p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "index.html"),
    render(layout, {
      title: p.title,
      description: p.description || "",
      date: p.date || "",
      url: `${SITE}/${p.slug}/`,
      content: p.content,
    }),
  );
}
await writeFile(join(OUT_DIR, "sitemap.xml"), sitemap(pages, today));
console.log(`built ${pages.length} page(s) → ${OUT_DIR}/`);
