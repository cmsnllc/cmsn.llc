import { useData } from "vike-react/useData";
import { Sheet } from "../../components/Sheet";
import { SiteFrame } from "../../components/SiteFrame";
import type { Data } from "./+data";

export default function Page() {
  const { id, lang, title, date, html, siblings } = useData<Data>();
  return (
    <SiteFrame lang={lang}>
      <Sheet label={`P/${id}`} lang={lang} siblings={siblings} date={date} title={title}>
        <div className="prose-cm" dangerouslySetInnerHTML={{ __html: html }} />
      </Sheet>
    </SiteFrame>
  );
}
