import { useData } from "vike-react/useData";
import { SiteFrame } from "../../components/SiteFrame";
import type { Data } from "./+data";

export default function Page() {
  const { id, lang, title, date, html, siblings } = useData<Data>();
  return (
    <SiteFrame>
      <article className="border-2 border-phosphor bg-paper text-ink">
        <div className="flex justify-between gap-4 bg-phosphor px-4 py-2 font-display text-label text-on-phosphor">
          <span>P/{id}</span>
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
          <h1 className="mb-8 text-[clamp(1.5rem,5vw,2rem)] leading-snug font-bold wrap-anywhere">{title}</h1>
          <div className="prose-cm" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>
    </SiteFrame>
  );
}
