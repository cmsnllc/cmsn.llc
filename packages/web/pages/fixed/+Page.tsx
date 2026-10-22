import { useData } from "vike-react/useData";
import { Sheet } from "../../components/Sheet";
import { SiteFrame } from "../../components/SiteFrame";
import type { Data } from "./+data";

export default function Page() {
  const { slug, lang, title, html, siblings } = useData<Data>();
  return (
    <SiteFrame lang={lang}>
      <Sheet label={slug.toUpperCase()} lang={lang} siblings={siblings} title={title}>
        <div className="prose-cm" dangerouslySetInnerHTML={{ __html: html }} />
      </Sheet>
    </SiteFrame>
  );
}
