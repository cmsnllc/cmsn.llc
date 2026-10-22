import type { ReactNode } from "react";
import { DEFAULT_LANG, navOf, type Lang } from "../content";
import "../pages/index.css";

const NAME: Record<Lang, string> = { ja: "カミング・スーン合同会社", en: "Coming Soon LLC" };

export function SiteFrame({ lang = DEFAULT_LANG, children }: { lang?: Lang; children: ReactNode }) {
  const nav = navOf(lang);
  return (
    <div className="font-body text-body text-phosphor selection:bg-phosphor selection:text-on-phosphor">
      <header className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-x-8 gap-y-4 px-4 py-8">
        <a className="font-display text-2xl no-underline" href="/">
          CMSN
        </a>
        <nav>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.map((n) => (
              <li key={n.slug}>
                <a className="underline" href={n.path}>
                  {n.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-content px-4">{children}</main>
      <footer className="mx-auto mt-20 max-w-content px-4 py-8 text-small text-phosphor-muted">
        <div className="border-t-2 border-line-faint pt-8">
          <a className="underline" href="/">
            {NAME[lang]}
          </a>
        </div>
      </footer>
    </div>
  );
}
