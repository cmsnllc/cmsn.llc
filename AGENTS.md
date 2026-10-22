# AGENTS.md

カミング・スーン合同会社 / Coming Soon LLC のコーポレートサイト https://cmsn.llc のリポジトリ。

運用に要る情報はこのファイルにまとめる。README は最小限にとどめ、詳細を書き足さない。設計の経緯や判断理由、spec / plan は repo に commit せず、rill の `cmsn.llc` project に `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` / `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` として置く。

- 個別ページと画像配信、モノレポ構成の設計: `docs/superpowers/specs/2026-10-22-individual-pages-design.md`

## 構成

pnpm workspaces のモノレポ。パッケージは `packages/web` と `packages/theme`。スタックは jgs.me にそろえてある。

`packages/web` は Vike + vike-react + Hono のサイトで、Cloudflare Workers 上で SSR する。ビルドは Vite と `@cloudflare/vite-plugin`。`+server.ts` の Hono に `@vikejs/hono` で Vike を載せ、`/media/*` と `/sitemap.xml` は Hono のルートで返す。対話的な要素がないので、`clientRouting: false` と `onRenderClient: null` でクライアントに React を載せず、HTML と CSS だけを返す。テストと lint はまだない。

```
package.json             ルート。packageManager で pnpm を固定。dev と build は web に委ねる
mise.toml                pnpm の版と mise の設定
.node-version            Node の版。mise と Workers Builds の両方が読む
pnpm-workspace.yaml      packages/* をワークスペースにする。依存の版は catalog
packages/theme/
  tokens.json            design token の正。デザインシステム Artifact と同じ形式
  guide.md               ブランドガイド。Artifact の README.md の正
  scripts/gen.ts         tokens.json から dist/theme.css (Tailwind の @theme) を生成
packages/web/
  wrangler.jsonc         Cloudflare Workers の設定
  vite.config.ts         react、vike、cloudflare の Vite プラグイン
  +server.ts             Worker のエントリ。Hono に Vike を載せる
  server/                Hono のルート。media.ts は R2 配信、sitemap.ts は sitemap.xml
  content.ts             content/*.md を読み込み、front matter と URL を扱う
  content/
    <id>.<lang>.md       個別ページの原稿。lang は ja か en
    _template.md         雛形。_ 始まりは読み込まない
    fixed/<slug>.<lang>.md  固定ページの原稿。slug は about、history、contact
  pages/
    +config.ts           全ページ共通の Vike 設定
    index.css            Tailwind の入力。theme を読み、Markdown 本文用の .prose-cm もここ
    home/                トップページ /。ワードマークと固定ページへのナビだけ
    article/             個別ページ /p/@id と /en/p/@id。+route.ts で両方を受ける
    fixed/               固定ページ /about、/history、/contact と /en 付き
    _error/              404 と 500
  components/SiteFrame.tsx  個別ページ、固定ページ、404 の共通の枠。ヘッダに固定ページのナビ
  components/Sheet.tsx      paper 地のコンテナ。個別ページと固定ページで共用
  public/                そのまま配信する静的ファイル。ロゴ画像など
  scripts/upload.ts      画像を R2 に上げるスクリプト
  dist/                  ビルド出力。git 管理外
README.md                最小限の説明
```

## TypeScript

- コードは基本 TypeScript で書く。サイトは Vite がバンドルし、`scripts/` と theme のスクリプトは Node の型ストリップで `node xxx.ts` として直接動かす。tsc はトランスパイルに使わず型検査だけ
- 型ストリップで動かすので enum、namespace、パラメータプロパティなど型を消すだけで済まない構文は使わない。`erasableSyntaxOnly` で弾かれる。Node で直接動かすファイルの相対 import には `.ts` 拡張子を付ける
- 版は mise で揃える。`mise install` で入る。Node は `.node-version`、pnpm は `mise.toml` に書く。Workers Builds は `mise.toml` も `package.json` の `engines` も読まず `.node-version` を読むので、Node の版はここが正。mise には `.node-version` を読む設定を入れてある
- pnpm の版は `package.json` の `packageManager` とも合わせる。Workers Builds はこちらを使う
- `pnpm typecheck` で全パッケージを検査する。`packages/web` は Worker とページ用の `tsconfig.json` と、Node 用の `tsconfig.node.json` の 2 つ
- 依存の版は `pnpm-workspace.yaml` の `catalog` で揃え、各 package.json は `catalog:` で参照する。Vike まわりは jgs.me と同じ版から始めている

## 個別ページの追加

1. `packages/web/content/_template.md` をコピーして `packages/web/content/<id>.<lang>.md` を作る。id は連番で、既存の最大の番号に 1 を足す。lang は `ja` か `en`。同じ記事の日英は同じ id にする
2. front matter の `title` は必須。`description`、`date`、`updated` は任意。`draft: true` で公開しない
3. 本文は Markdown。生 HTML も書ける
4. `pnpm dev` で確認。日本語は `/p/<id>`、英語は `/en/p/<id>` で公開される。既定は日本語。片方の言語しかない記事はその言語でだけ出る。両方あれば hreflang の相互リンクとタイトルバーの言語切り替えが付く

原稿は `import.meta.glob` でビルド時に Worker に埋め込まれ、Markdown はリクエスト時に `marked` で HTML にする。

## 固定ページ

会社概要 `/about`、沿革 `/history`、お問い合わせ `/contact` は `packages/web/content/fixed/<slug>.<lang>.md` に書く。英語は `/en/<slug>`。front matter は `title` が必須で、`description` と `updated` は任意。`title` はヘッダとトップのナビの文言にもなる。会社情報や沿革は `<dl>` で書くと `.prose-cm` で 2 列に並ぶ。

固定ページを増やす時は `content.ts` の `FIXED_SLUGS` と `pages/fixed/+route.ts` の正規表現の両方に slug を足す。`+route.ts` は Vike の設定読み込み時にも動くので `content.ts` を import できない。

## 画像

画像は git に入れず R2 バケット `cmsn-llc-media` に置き、Worker が `/media/<key>` で配信する。

```sh
pnpm upload path/to/photo.jpg            # key はファイル名
pnpm upload path/to/photo.jpg about/hero.jpg
```

最後に `![](/media/<key>)` が出るので本文に貼る。wrangler のログインが必要。同じ key で上書きしても edge キャッシュに最大 1 日残るので、差し替える時は key を変える。ロゴなど少数の固定アセットは `packages/web/public/` に置いてよい。

## スタイル

- Tailwind CSS v4 を `@tailwindcss/postcss` で通す。スキャン対象は `pages/` と `components/` だけ。Markdown にクラスは書かない
- 色、フォント、文字サイズは `packages/theme` のトークンを使う。`text-phosphor`、`bg-bg`、`font-display`、`text-wordmark` など。spacing / radius / border のトークンは Tailwind 既定と数字の意味がぶつかるので生成せず、対応は `guide.md` に書いてある
- 個別ページは黒い画面の中に `paper` 地の記事コンテナを置く。トップとはテーマを分けてある。コンテナ内の色は `ink` 系のトークンを使い、`phosphor` 系は使わない
- Markdown 本文の見た目は `pages/index.css` の `.prose-cm`
- トップは Tailwind 化前と見た目をピクセル単位で揃えてある。preflight の打ち消しで `font-[serif]`、`leading-[normal]`、`box-content`、`ml-10` などを付けているのはそのため。デザインを変える時に外す
- vike-react の `bodyAttributes` は全ページ共通の設定なので、ページごとの文字色やフォントは body ではなくページの一番外の要素に付ける。body の背景だけ `index.css` で `bg-bg` にしている

## デザインシステム

正は repo の `packages/theme`。デザインシステム Artifact https://claude.ai/artifact/2RQNEJ6wiGAm2qgi7XTD8T はそこから写す下流で、Artifact 側を直接直さない。

- トークンを変える時は `packages/theme/tokens.json` を直す。`pnpm build` で `dist/theme.css` が再生成される
- 文言や使い方のルールは `packages/theme/guide.md`
- 変えたら Artifact に反映する。`tokens.json` を `project/tokens.json`、`guide.md` を `project/README.md` として Artifact に publish し、最後に `project/design-system.json` の `lastChange` を repo の commit で更新する。Claude に「デザインシステムを repo から同期して」と頼めばこの手順でやる
- Artifact の部品プレビュー (`project/components/`) は Artifact 側だけのもの。サイトの部品は Tailwind のクラスで組む

## デプロイ

- 本番は Cloudflare Workers。Worker 名 `cmsn-llc`。Netlify → Cloudflare Pages → Workers の static assets → Vike の SSR と移行してきた
- 設定は `packages/web/wrangler.jsonc`。`vite build` が `packages/web/dist/cmsn_llc/wrangler.json` を生成し、`packages/web/.wrangler/deploy/config.json` からそこへリダイレクトされるので、`wrangler deploy` は `packages/web` で打つ
- Workers Builds の設定は、ルートディレクトリ `packages/web`、ビルドコマンド `pnpm build`、デプロイコマンド `npx wrangler deploy`、ブランチのデプロイコマンド `npx wrangler preview`。依存のインストールは Workers Builds がリポジトリルートの `pnpm-lock.yaml` を見て pnpm でやる。`packages/web` の `build` は theme の生成から先にやる
- Workers Builds の Git 連携で、デフォルトブランチ `master` への push が本番デプロイ
- `master` 以外のブランチは Worker Previews。ブランチごとのプレビュー URL が発行され、Workers Builds のチェックとして PR に出る。`wrangler.jsonc` の `previews` ブロックは必須で、Preview は本番設定を引き継がない。binding を足したら `previews` 側にも書く。`MEDIA` は Preview も本番と同じバケットを読む
- `run_worker_first: true` で全リクエストが Worker を通る。ログとトレースを取るため。`/media/*` と `/sitemap.xml` は Hono が返し、それ以外の拡張子付きのパスは `env.ASSETS` に渡す。全リクエストが Worker リクエストとして課金対象になる
- 404 は Vike の `pages/_error` が返す。ステータスは 404
- URL は末尾スラッシュ無しが正。Vike の既定で `/p/1/` は `/p/1` に 301 で寄せる
- `observability` で Workers Logs、Traces、Issues を全量サンプリングで有効化している

## ローカル確認

```sh
mise install
pnpm install
pnpm dev
```

Vite の dev サーバーが `http://localhost:3000` で立つ。Worker は workerd の中で動くので、本番と同じ挙動になる。本番ビルドを確かめるなら `pnpm build` のあと `packages/web` で `pnpm preview`。`/media/*` はローカルの R2 を読むので、試すなら `packages/web` で `npx wrangler r2 object put cmsn-llc-media/<key> --file <file> --local` で入れる。

## 外部依存

トップの `pages/home/+Head.tsx` が読み込んでいるもの。

- Google Fonts の Press Start 2P
- Google Analytics `UA-132382103-1`。Universal Analytics は既に計測停止済み
- Google Search Console の site verification meta タグ。消さないこと
- お問い合わせは Google Forms の iframe 埋め込み。`pages/home/+Page.tsx`

## 編集時の注意

- 会社情報 `<dl>` は日本語と英語を `/` 区切りで併記する形式を維持する
- 配色は背景 `bg-bg`、文字 `text-phosphor`
- `sitemap.xml` は `server/sitemap.ts` がリクエスト時に生成する。トップの `<lastmod>` はそこに直書きなので、トップを大きく更新した時はそこを直す
- サイトの日本語の文章は「です・ます」調。詳しくは `packages/theme/guide.md`
- コードコメントは最小限
- UI 文言に括弧書きは極力使わない

## 既知の問題

手を入れる時はついでに直すか、別 PR に分けるか判断する。

- トップに viewport meta がない。`pages/home/+config.ts` の `viewport: null` で消している。足すとスマホで 20rem のワードマークがはみ出すので、デザインの見直しと一緒にやる
