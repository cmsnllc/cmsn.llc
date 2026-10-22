import { useData } from "vike-react/useData";
import { DEFAULT_LANG } from "../../content";
import type { Data } from "./+data";

export function Head() {
  const { url, siblings } = useData<Data>();
  const fallback = siblings.find((s) => s.lang === DEFAULT_LANG);
  return (
    <>
      <link rel="canonical" href={url} />
      {siblings.length > 1 &&
        siblings.map((s) => <link key={s.lang} rel="alternate" hrefLang={s.lang} href={s.url} />)}
      {siblings.length > 1 && fallback && <link rel="alternate" hrefLang="x-default" href={fallback.url} />}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=M+PLUS+1+Code:wght@400;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
