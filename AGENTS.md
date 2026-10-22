# AGENTS.md

カミング・スーン合同会社 / Coming Soon LLC のコーポレートサイト https://cmsn.llc のリポジトリ。

## 構成

静的サイト。`build.js` が `docs/` をそのまま `dist/` にコピーし、`pages/*.md` を共通レイアウトで HTML にして `dist/<slug>/index.html` に書き出す。依存は Markdown 変換の `marked` だけ。テスト、lint はない。

```
docs/
  index.html       トップページ。CSS は <style> にインライン
  404.html         404 ページ
  assets/site.css  個別ページ共通の CSS。クラス接頭辞 cm-
pages/
  *.md             個別ページの原稿。ファイル名が URL になる
  _template.md     雛形。_ 始まりはビルド対象外
layouts/page.html  個別ページの共通レイアウト
build.js           ビルドスクリプト。sitemap.xml もここで生成
dist/              ビルド出力。git 管理外
scripts/upload.js  画像を R2 に上げるスクリプト
src/index.js       Worker スクリプト。/media/* は R2、それ以外は ASSETS に渡す
wrangler.jsonc     Cloudflare Workers の設定。dist/ を static assets として配信
README.md          ページの追加手順
```

## 個別ページの追加

1. `pages/_template.md` をコピーして `pages/<slug>.md` を作る。slug は英小文字、数字、ハイフンのみ
2. front matter の `title` は必須。`description`、`date`、`updated` は任意。`draft: true` でビルド対象外
3. 本文は Markdown。生 HTML も書ける
4. `npm run build` か `npx wrangler dev` で確認。`/<slug>/` で公開される

## 画像

画像は git に入れず R2 バケット `cmsn-llc-media` に置き、Worker が `/media/<key>` で配信する。

```sh
npm run upload -- path/to/photo.jpg            # key はファイル名
npm run upload -- path/to/photo.jpg about/hero.jpg
```

最後に `![](/media/<key>)` が出るので本文に貼る。wrangler のログインが必要。同じ key で上書きしても edge キャッシュに最大 1 日残るので、差し替える時は key を変える。ロゴなど少数の固定アセットは従来どおり `docs/` に置いてよい。

レイアウトは `layouts/page.html`。`{{ key }}` はエスケープして、`{{{ key }}}` は生のまま差し込む。使える key は `title`、`description`、`date`、`url`、`content`。

## デプロイ

- 本番は Cloudflare Workers の static assets 配信。Worker 名 `cmsn-llc`。Netlify → Cloudflare Pages → Workers と移行してきた
- 設定は `wrangler.jsonc`。`assets.directory` が `./dist`。`build.command` で `wrangler deploy`、`preview`、`dev` の前に `npm run build` が走る。依存のインストールは Workers Builds が自動でやる。`run_worker_first: true` で全リクエストが `src/index.js` を通り、`/media/*` は R2 binding `MEDIA` から、それ以外は `env.ASSETS.fetch()` でアセットを返す。ログとトレースを取るため。全リクエストが Worker リクエストとして課金対象になる
- Workers Builds の Git 連携で、デフォルトブランチ `master` への push が本番デプロイ。デプロイコマンドは `npx wrangler deploy`
- `master` 以外のブランチは Worker Previews。`npx wrangler preview` でブランチごとのプレビュー URL が発行され、Workers Builds のチェックとして PR に出る。`wrangler.jsonc` の `previews` ブロックは必須で、Preview は本番設定を引き継がない。binding を足したら `previews` 側にも書く。`MEDIA` は Preview も本番と同じバケットを読む
- 404 は `not_found_handling: "404-page"` で `docs/404.html` を返す。ステータスは 404
- URL 末尾スラッシュや `.html` 省略の扱いは `html_handling` のデフォルト `auto-trailing-slash`。Pages と同じ挙動
- `observability` で Workers Logs、Traces、Issues を全量サンプリングで有効化している

## ローカル確認

```sh
npm install
npx wrangler dev
```

`http://localhost:8787` を開く。404 の挙動も本番と同じになる。`docs/`、`pages/`、`layouts/` の変更で再ビルドされる。wrangler なしなら `npm run build && python3 -m http.server -d dist 8000` でもいい。

## 外部依存

`docs/index.html` が読み込んでいるもの。

- Google Fonts の Press Start 2P
- Google Analytics `UA-132382103-1`。Universal Analytics は既に計測停止済み
- Google Search Console の site verification meta タグ。消さないこと
- お問い合わせは Google Forms の iframe 埋め込み

## 編集時の注意

- `<meta charset="utf-8">` は消さないこと。Workers の assets 配信は `Content-Type: text/html` に charset を付けないので、これがないと日本語が文字化けする
- 会社情報 `<dl>` は日本語と英語を `/` 区切りで併記する形式を維持する
- 配色は背景 `#000`、文字 `#00C400`
- `sitemap.xml` はビルドで生成する。トップの `<lastmod>` は `build.js` に直書きなので、トップを大きく更新した時はそこを直す
- 画像など静的ファイルは `docs/` 配下に置く。リポジトリ直下に置いたものは配信されない
- コードコメントは最小限
- UI 文言に括弧書きは極力使わない

## 既知の問題

手を入れる時はついでに直すか、別 PR に分けるか判断する。

- `index.html` に `<!doctype html>`、`<html>`、viewport meta がない
- `<h1>SN</h2>` の閉じタグが不一致
- `404.html` は `<h1>404</h1>` だけでスタイルなし
