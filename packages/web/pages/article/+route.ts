import type { PageContext } from "vike/types";

export function route(pageContext: PageContext) {
  const m = pageContext.urlPathname.match(/^(?:\/(en))?\/p\/([1-9][0-9]*)\/?$/);
  if (!m) return false;
  return { routeParams: { lang: m[1] ?? "ja", id: m[2] } };
}
