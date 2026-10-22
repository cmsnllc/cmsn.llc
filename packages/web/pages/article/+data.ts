import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { findArticle, pathOf, renderBody, siblingsOf, SITE, type Lang } from "../../content";

export type Data = ReturnType<typeof data>;

export function data(pageContext: PageContextServer) {
  const { id, lang } = pageContext.routeParams as { id: string; lang: Lang };
  const article = findArticle(id, lang);
  if (!article) throw render(404);
  return {
    id,
    lang,
    title: article.title,
    description: article.description ?? "",
    date: article.date ?? "",
    url: `${SITE}${pathOf(article)}`,
    html: renderBody(article),
    siblings: siblingsOf(id).map((s) => ({ lang: s.lang, path: pathOf(s), url: `${SITE}${pathOf(s)}` })),
  };
}
