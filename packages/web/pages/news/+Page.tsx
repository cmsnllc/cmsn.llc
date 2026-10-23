import { useData } from "vike-react/useData";
import { Sheet } from "../../components/Sheet";
import { SiteFrame } from "../../components/SiteFrame";
import type { Data } from "./+data";

const EMPTY = { ja: "まだお知らせはありません。", en: "No news yet." } as const;

export default function Page() {
  const { lang, title, items, siblings } = useData<Data>();
  return (
    <SiteFrame lang={lang}>
      <Sheet label="NEWS" lang={lang} siblings={siblings} title={title}>
        {items.length === 0 ? (
          <p>{EMPTY[lang]}</p>
        ) : (
          <ul className="border-t-2 border-ink-line">
            {items.map((a) => (
              <li key={a.id} className="border-b-2 border-ink-line">
                <a className="group flex flex-col gap-1 py-4 no-underline focus-visible:outline-2 focus-visible:outline-ink-link sm:flex-row sm:gap-8" href={a.path}>
                  {a.date && (
                    <time className="shrink-0 font-display text-label text-ink-muted sm:pt-1" dateTime={a.date}>
                      {a.date}
                    </time>
                  )}
                  <span className="text-ink-link underline group-hover:no-underline">{a.title}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </SiteFrame>
  );
}
