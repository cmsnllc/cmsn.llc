import { useData } from "vike-react/useData";
import { SheetHead } from "../../components/SheetHead";
import type { Data } from "./+data";

export function Head() {
  const { url, siblings } = useData<Data>();
  return <SheetHead url={url} siblings={siblings} />;
}
