import type { PageContext } from "vike/types";

export function route(pageContext: PageContext) {
  const m = pageContext.urlPathname.match(/^(?:\/(en))?\/news\/?$/);
  if (!m) return false;
  return { routeParams: { lang: m[1] ?? "ja" } };
}
