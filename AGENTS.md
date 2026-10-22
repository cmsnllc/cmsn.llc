# AGENTS.md

カミング・スーン合同会社 / Coming Soon LLC のコーポレートサイト https://cmsn.llc のリポジトリ。

運用に要る情報はこのファイルにまとめる。README は最小限にとどめ、詳細を書き足さない。設計の経緯や判断理由、spec / plan は repo に commit せず、rill の `cmsn.llc` project に `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` / `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` として置く。

- 個別ページと画像配信、モノレポ構成の設計: `docs/superpowers/specs/2026-10-22-individual-pages-design.md`

## 構成

pnpm workspaces のモノレポ。パッケージは `packages/web` と `packages/theme`。

`packages/web` は静的サイトと Worker。`build.ts` が `docs/` をそのまま `dist/` にコピーし、`pages/*.md` を共通レイアウトで HTML にして `dist/p/<id>/index.html` に書き出す。続けて Tailwind CSS v4 の CLI が `src/styles.css` から `dist/assets/site.css` を生成する。テストと lint はまだない。

```
package.json             ルート。packageManager で pnpm を固定、wrangler もここ
mise.toml                pnpm の版と mise の設定
.node-version            Node の版。mise と Workers Builds の両方が読む
pnpm-workspace.yaml      packages/* をワークスペースにする
wrangler.jsonc           Cloudflare Workers の設定。パスは packages/web を指す
packages/theme/
  tokens.json            design token の正。デザインシステム Artifact と同じ形式
  guide.md               ブランドガイド。Artifact の README.md の正
  scripts/gen.ts         tokens.json から dist/theme.css (Tailwind の @theme) を生成
packages/web/
  docs/
    index.html           トップページ。Tailwind のクラスで書く
    404.html             404 ページ
  pages/
    *.md                 個別ページの原稿。ファイル名が /p/<id>/ の id になる
    _template.md         雛形。_ 始まりはビルド対象外
  layouts/page.html      個別ページの共通レイアウト
  build.ts               ビルドスクリプト。sitemap.xml もここで生成
  dist/                  ビルド出力。git 管理外
  scripts/upload.ts      画像を R2 に上げるスクリプト
  src/styles.css         Tailwind の入力。theme を読み、Markdown 本文用の .prose-cm もここ
  src/index.ts           Worker スクリプト。/media/* は R2、それ以外は ASSETS に渡す
README.md                ページの追加手順
```

`wrangler.jsonc` をルートに置いているのは、Workers Builds のルートディレクトリ設定を変えずに済ませるため。Worker を増やす時は各パッケージに `wrangler.jsonc` を置き、Workers Builds 側でルートディレクトリを分ける。

## TypeScript

- コードは基本 TypeScript で書く。Worker は wrangler がバンドルし、ビルドやスクリプトは Node の型ストリップで `node xxx.ts` として直接動かす。tsc はトランスパイルに使わず型検査だけ
- 型ストリップで動かすので enum、namespace、パラメータプロパティなど型を消すだけで済まない構文は使わない。`erasableSyntaxOnly` で弾かれる。相対 import には `.ts` 拡張子を付ける
- 版は mise で揃える。`mise install` で入る。Node は `.node-version`、pnpm は `mise.toml` に書く。Workers Builds は `mise.toml` も `package.json` の `engines` も読まず `.node-version` を読むので、Node の版はここが正。mise には `.node-version` を読む設定を入れてある
- pnpm の版は `package.json` の `packageManager` とも合わせる。Workers Builds はこちらを使う
- `pnpm typecheck` で全パッケージを検査する。`packages/web` は Worker 用の `tsconfig.json` とビルド用の `tsconfig.node.json` の 2 つ
- 依存の版は `pnpm-workspace.yaml` の `catalog` で揃え、各 package.json は `catalog:` で参照する

## 個別ページの追加

1. `packages/web/pages/_template.md` をコピーして `packages/web/pages/<id>.md` を作る。id は連番で、既存の最大の番号に 1 を足す
2. front matter の `title` は必須。`description`、`date`、`updated` は任意。`draft: true` でビルド対象外
3. 本文は Markdown。生 HTML も書ける
4. `pnpm build` か `pnpm dev` で確認。`/p/<id>/` で公開される

## 画像

画像は git に入れず R2 バケット `cmsn-llc-media` に置き、Worker が `/media/<key>` で配信する。

```sh
pnpm upload path/to/photo.jpg            # key はファイル名
pnpm upload path/to/photo.jpg about/hero.jpg
```

最後に `![](/media/<key>)` が出るので本文に貼る。wrangler のログインが必要。同じ key で上書きしても edge キャッシュに最大 1 日残るので、差し替える時は key を変える。ロゴなど少数の固定アセットは従来どおり `packages/web/docs/` に置いてよい。

レイアウトは `packages/web/layouts/page.html`。`{{ key }}` はエスケープして、`{{{ key }}}` は生のまま差し込む。使える key は `id`、`title`、`description`、`date`、`url`、`content`。

## スタイル

- Tailwind CSS v4。スキャン対象は `docs/` と `layouts/` だけなので、クラスはこの2か所に書く。Markdown にクラスは書かない
- 色、フォント、文字サイズは `packages/theme` のトークンを使う。`text-phosphor`、`bg-bg`、`font-display`、`text-wordmark` など。spacing / radius / border のトークンは Tailwind 既定と数字の意味がぶつかるので生成せず、対応は `guide.md` に書いてある
- 個別ページは黒い画面の中に `paper` 地の記事コンテナを置く。トップとはテーマを分けてある。コンテナ内の色は `ink` 系のトークンを使い、`phosphor` 系は使わない
- Markdown 本文の見た目は `src/styles.css` の `.prose-cm`
- `index.html` は Tailwind 化前と見た目をピクセル単位で揃えてある。preflight の打ち消しで `font-[serif]`、`leading-[normal]`、`box-content`、`ml-10` などを付けているのはそのため。デザインを変える時に外す

## デザインシステム

正は repo の `packages/theme`。デザインシステム Artifact https://claude.ai/artifact/2RQNEJ6wiGAm2qgi7XTD8T はそこから写す下流で、Artifact 側を直接直さない。

- トークンを変える時は `packages/theme/tokens.json` を直す。`pnpm build` で `dist/theme.css` が再生成される
- 文言や使い方のルールは `packages/theme/guide.md`
- 変えたら Artifact に反映する。`tokens.json` を `project/tokens.json`、`guide.md` を `project/README.md` として Artifact に publish し、最後に `project/design-system.json` の `lastChange` を repo の commit で更新する。Claude に「デザインシステムを repo から同期して」と頼めばこの手順でやる
- Artifact の部品プレビュー (`project/components/`) は Artifact 側だけのもの。サイトの部品は Tailwind のクラスで組む

## デプロイ

- 本番は Cloudflare Workers の static assets 配信。Worker 名 `cmsn-llc`。Netlify → Cloudflare Pages → Workers と移行してきた
- 設定は `wrangler.jsonc`。`assets.directory` が `./packages/web/dist`。`build.command` で `wrangler deploy`、`preview`、`dev` の前に `pnpm build` が走る。依存のインストールは Workers Builds が `pnpm-lock.yaml` を見て pnpm で自動でやり、wrangler もルートの devDependencies の版が使われる。`run_worker_first: true` で全リクエストが `packages/web/src/index.ts` を通り、`/media/*` は R2 binding `MEDIA` から、それ以外は `env.ASSETS.fetch()` でアセットを返す。ログとトレースを取るため。全リクエストが Worker リクエストとして課金対象になる
- Workers Builds の Git 連携で、デフォルトブランチ `master` への push が本番デプロイ。デプロイコマンドは `npx wrangler deploy`
- `master` 以外のブランチは Worker Previews。`npx wrangler preview` でブランチごとのプレビュー URL が発行され、Workers Builds のチェックとして PR に出る。`wrangler.jsonc` の `previews` ブロックは必須で、Preview は本番設定を引き継がない。binding を足したら `previews` 側にも書く。`MEDIA` は Preview も本番と同じバケットを読む
- 404 は `not_found_handling: "404-page"` で `packages/web/docs/404.html` を返す。ステータスは 404
- URL 末尾スラッシュや `.html` 省略の扱いは `html_handling` のデフォルト `auto-trailing-slash`。Pages と同じ挙動
- `observability` で Workers Logs、Traces、Issues を全量サンプリングで有効化している

## ローカル確認

```sh
mise install
pnpm install
pnpm dev
```

`http://localhost:8787` を開く。404 の挙動も本番と同じになる。`packages/web` の `docs/`、`pages/`、`layouts/` の変更で再ビルドされる。`/media/*` はローカルの R2 を読むので、試すなら `pnpm exec wrangler r2 object put cmsn-llc-media/<key> --file <file> --local` で入れる。wrangler なしなら `pnpm build && python3 -m http.server -d packages/web/dist 8000` でもいい。

## 外部依存

`packages/web/docs/index.html` が読み込んでいるもの。

- Google Fonts の Press Start 2P
- Google Analytics `UA-132382103-1`。Universal Analytics は既に計測停止済み
- Google Search Console の site verification meta タグ。消さないこと
- お問い合わせは Google Forms の iframe 埋め込み

## 編集時の注意

- `<meta charset="utf-8">` は消さないこと。Workers の assets 配信は `Content-Type: text/html` に charset を付けないので、これがないと日本語が文字化けする
- 会社情報 `<dl>` は日本語と英語を `/` 区切りで併記する形式を維持する
- 配色は背景 `bg-bg`、文字 `text-phosphor`
- `sitemap.xml` はビルドで生成する。トップの `<lastmod>` は `packages/web/build.ts` に直書きなので、トップを大きく更新した時はそこを直す
- 静的ファイルは `packages/web/docs/` 配下に置く。それ以外の場所に置いたものは配信されない
- コードコメントは最小限
- UI 文言に括弧書きは極力使わない

## 既知の問題

手を入れる時はついでに直すか、別 PR に分けるか判断する。

- `index.html` に viewport meta がない。足すとスマホで 20rem のワードマークがはみ出すので、デザインの見直しと一緒にやる
- `404.html` は `<h1>404</h1>` だけでスタイルなし
