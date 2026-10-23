import { marked } from "marked";

export const SITE = "https://cmsn.llc";
export const LANGS = ["ja", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ja";

export interface Article {
  id: string;
  lang: Lang;
  title: string;
  description?: string;
  date?: string;
  updated?: string;
  body: string;
}

const sources = import.meta.glob<string>("./content/*.md", { query: "?raw", import: "default", eager: true });
const fixedSources = import.meta.glob<string>("./content/fixed/*.md", { query: "?raw", import: "default", eager: true });

function parseFrontMatter(src: string): { data: Record<string, string>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: src.slice(m[0].length) };
}

function load(): Article[] {
  const articles: Article[] = [];
  for (const [path, src] of Object.entries(sources)) {
    const file = path.slice(path.lastIndexOf("/") + 1);
    if (file.startsWith("_")) continue;
    const m = file.match(/^([1-9][0-9]*)\.([a-z]+)\.md$/);
    if (!m || !(LANGS as readonly string[]).includes(m[2]))
      throw new Error(`${file}: ファイル名は <連番>.<${LANGS.join("|")}>.md`);
    const { data, body } = parseFrontMatter(src);
    if (data.draft === "true") continue;
    if (!data.title) throw new Error(`${file}: front matter に title がない`);
    articles.push({
      id: m[1],
      lang: m[2] as Lang,
      title: data.title,
      description: data.description,
      date: data.date,
      updated: data.updated,
      body,
    });
  }
  return articles.sort(
    (a, b) => a.id.localeCompare(b.id, "en", { numeric: true }) || LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang),
  );
}

export const articles = load();

export const pathOf = (a: Pick<Article, "id" | "lang">): string =>
  `${a.lang === DEFAULT_LANG ? "" : `/${a.lang}`}/p/${a.id}`;

export const findArticle = (id: string, lang: Lang): Article | undefined =>
  articles.find((a) => a.id === id && a.lang === lang);

export const siblingsOf = (id: string): Article[] => articles.filter((a) => a.id === id);

export const renderBody = (a: Pick<Article, "body">): string => marked.parse(a.body, { async: false });

export const FIXED_SLUGS = ["about", "business", "history", "contact"] as const;
export type FixedSlug = (typeof FIXED_SLUGS)[number];

export interface FixedPage {
  slug: FixedSlug;
  lang: Lang;
  title: string;
  description?: string;
  updated?: string;
  hideTitle: boolean;
  body: string;
}

function loadFixed(): FixedPage[] {
  const pages: FixedPage[] = [];
  for (const [path, src] of Object.entries(fixedSources)) {
    const file = path.slice(path.lastIndexOf("/") + 1);
    const m = file.match(/^([a-z]+)\.([a-z]+)\.md$/);
    if (!m || !(FIXED_SLUGS as readonly string[]).includes(m[1]) || !(LANGS as readonly string[]).includes(m[2]))
      throw new Error(`fixed/${file}: ファイル名は <${FIXED_SLUGS.join("|")}>.<${LANGS.join("|")}>.md`);
    const { data, body } = parseFrontMatter(src);
    if (!data.title) throw new Error(`fixed/${file}: front matter に title がない`);
    pages.push({
      slug: m[1] as FixedSlug,
      lang: m[2] as Lang,
      title: data.title,
      description: data.description,
      updated: data.updated,
      hideTitle: data.hideTitle === "true",
      body,
    });
  }
  return pages.sort(
    (a, b) => FIXED_SLUGS.indexOf(a.slug) - FIXED_SLUGS.indexOf(b.slug) || LANGS.indexOf(a.lang) - LANGS.indexOf(b.lang),
  );
}

export const fixedPages = loadFixed();

const langPrefix = (lang: Lang): string => (lang === DEFAULT_LANG ? "" : `/${lang}`);

export const fixedPathOf = (p: Pick<FixedPage, "slug" | "lang">): string => `${langPrefix(p.lang)}/${p.slug}`;

export const findFixed = (slug: string, lang: Lang): FixedPage | undefined =>
  fixedPages.find((p) => p.slug === slug && p.lang === lang);

export const fixedSiblingsOf = (slug: FixedSlug): FixedPage[] =>
  LANGS.map((lang) => findFixed(slug, lang)).filter((p) => p !== undefined);

export const NEWS_TITLE: Record<Lang, string> = { ja: "お知らせ", en: "News" };
export const NEWS_DESCRIPTION: Record<Lang, string> = {
  ja: "カミング・スーン合同会社からのお知らせです。",
  en: "News from Coming Soon LLC.",
};

export const newsPathOf = (lang: Lang): string => `${langPrefix(lang)}/news`;

export const newsOf = (lang: Lang): Article[] =>
  articles
    .filter((a) => a.lang === lang)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.id.localeCompare(a.id, "en", { numeric: true }));

export const newsLastmod = (lang: Lang): string | undefined =>
  newsOf(lang)
    .map((a) => a.updated || a.date)
    .filter((d) => d !== undefined)
    .sort()
    .at(-1);

const NAV_ORDER = ["about", "business", "history", "news", "contact"] as const;

export const navOf = (lang: Lang): { slug: (typeof NAV_ORDER)[number]; title: string; path: string }[] =>
  NAV_ORDER.map((slug) => {
    if (slug === "news") return { slug, title: NEWS_TITLE[lang], path: newsPathOf(lang) };
    const p = findFixed(slug, lang) ?? findFixed(slug, DEFAULT_LANG);
    return p && { slug, title: p.title, path: fixedPathOf(p) };
  }).filter((n) => n !== undefined);
