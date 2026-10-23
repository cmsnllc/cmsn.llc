import type { ReactNode } from "react";
import type { Lang } from "../content";

export interface Sibling {
  lang: Lang;
  path: string;
}

export function Sheet({
  label,
  lang,
  siblings,
  date,
  title,
  hideTitle = false,
  children,
}: {
  label: string;
  lang: Lang;
  siblings: Sibling[];
  date?: string;
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <article className="border-2 border-phosphor bg-paper text-ink">
      <div className="flex justify-between gap-4 bg-phosphor px-4 py-2 font-display text-label text-on-phosphor">
        <span>{label}</span>
        <span className="flex gap-4">
          {siblings.length > 1 && (
            <span>
              {siblings.map((s, i) => (
                <span key={s.lang}>
                  {i > 0 && " / "}
                  {s.lang === lang ? (
                    <span aria-current="page">{s.lang.toUpperCase()}</span>
                  ) : (
                    <a className="underline" href={s.path} hrefLang={s.lang} lang={s.lang}>
                      {s.lang.toUpperCase()}
                    </a>
                  )}
                </span>
              ))}
            </span>
          )}
          {date && <time dateTime={date}>{date}</time>}
        </span>
      </div>
      <div className="px-5 pt-8 pb-10 sm:px-10 sm:pt-12 sm:pb-14">
        <h1 className={hideTitle ? "sr-only" : "mb-8 text-[clamp(1.5rem,5vw,2rem)] leading-snug font-bold wrap-anywhere"}>{title}</h1>
        {children}
      </div>
    </article>
  );
}
