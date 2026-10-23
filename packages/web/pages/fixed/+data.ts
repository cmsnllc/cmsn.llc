import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { findFixed, fixedPathOf, fixedSiblingsOf, renderBody, SITE, type Lang } from "../../content";

export type Data = ReturnType<typeof data>;

export function data(pageContext: PageContextServer) {
  const { slug, lang } = pageContext.routeParams as { slug: string; lang: Lang };
  const page = findFixed(slug, lang);
  if (!page) throw render(404);
  return {
    slug: page.slug,
    lang,
    title: page.title,
    hideTitle: page.hideTitle,
    description: page.description ?? "",
    url: `${SITE}${fixedPathOf(page)}`,
    html: renderBody(page),
    siblings: fixedSiblingsOf(page.slug).map((s) => ({
      lang: s.lang,
      path: fixedPathOf(s),
      url: `${SITE}${fixedPathOf(s)}`,
    })),
  };
}
