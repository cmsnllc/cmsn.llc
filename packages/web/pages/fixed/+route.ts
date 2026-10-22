import type { PageContext } from "vike/types";

// content.ts の FIXED_SLUGS と揃える。+route.ts は設定読み込み時にも実行されるので content.ts を import できない
export function route(pageContext: PageContext) {
  const m = pageContext.urlPathname.match(/^(?:\/(en))?\/(about|history|contact)\/?$/);
  if (!m) return false;
  return { routeParams: { lang: m[1] ?? "ja", slug: m[2] } };
}
