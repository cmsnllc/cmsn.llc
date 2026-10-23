import type { PageContextServer } from "vike/types";
import { LANGS, NEWS_DESCRIPTION, NEWS_TITLE, newsOf, newsPathOf, pathOf, SITE, type Lang } from "../../content";

export type Data = ReturnType<typeof data>;

export function data(pageContext: PageContextServer) {
  const { lang } = pageContext.routeParams as { lang: Lang };
  return {
    lang,
    title: NEWS_TITLE[lang],
    description: NEWS_DESCRIPTION[lang],
    url: `${SITE}${newsPathOf(lang)}`,
    items: newsOf(lang).map((a) => ({ id: a.id, title: a.title, date: a.date, path: pathOf(a) })),
    siblings: LANGS.map((l) => ({ lang: l, path: newsPathOf(l), url: `${SITE}${newsPathOf(l)}` })),
  };
}
