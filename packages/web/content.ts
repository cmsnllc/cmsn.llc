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
  `${a.lang === DEFAULT_LANG ? "" : `/${a.lang}`}/p/${a.id}/`;

export const findArticle = (id: string, lang: Lang): Article | undefined =>
  articles.find((a) => a.id === id && a.lang === lang);

export const siblingsOf = (id: string): Article[] => articles.filter((a) => a.id === id);

export const renderBody = (a: Article): string => marked.parse(a.body, { async: false });
