import { usePageContext } from "vike-react/usePageContext";
import { SiteFrame } from "../../components/SiteFrame";

export default function Page() {
  const { is404 } = usePageContext();
  return (
    <SiteFrame>
        <h1 className="my-8 font-display text-display">{is404 ? "404" : "500"}</h1>
        <p>{is404 ? "ページが見つかりません / Page not found" : "エラーが発生しました / Something went wrong"}</p>
    </SiteFrame>
  );
}
