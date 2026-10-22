import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

export const config = {
  extends: [vikeReact],
  lang: "ja",
  // 対話的な要素がないので React をクライアントに載せない。jgs.me の img と同じ
  clientRouting: false,
  // @ts-expect-error vike の型が null による継承の打ち消しを表現していない
  onRenderClient: null,
} satisfies Config;
