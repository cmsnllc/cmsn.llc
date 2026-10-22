# AGENTS.md

カミング・スーン合同会社 / Coming Soon LLC のコーポレートサイト https://cmsn.llc のリポジトリ。

## 構成

ビルド工程なしの静的サイト。パッケージマネージャ、依存、テスト、lint は存在しない。

```
docs/
  index.html    トップページ。CSS は <style> にインライン
  404.html      404 ページ
  sitemap.xml   サイトマップ
src/index.js    Worker スクリプト。全リクエストを受けて ASSETS に渡すだけ
wrangler.jsonc  Cloudflare Workers の設定。docs/ を static assets として配信
README.md       タイトルのみ
```

## デプロイ

- 本番は Cloudflare Workers の static assets 配信。Worker 名 `cmsn-llc`。Netlify → Cloudflare Pages → Workers と移行してきた
- 設定は `wrangler.jsonc`。`assets.directory` が `./docs`。`run_worker_first: true` で全リクエストが `src/index.js` を通り、`env.ASSETS.fetch()` でアセットを返す。ログとトレースを取るため。全リクエストが Worker リクエストとして課金対象になる
- Workers Builds の Git 連携で、デフォルトブランチ `master` への push が本番デプロイ。デプロイコマンドは `npx wrangler deploy`
- `master` 以外のブランチは Worker Previews。`npx wrangler preview` でブランチごとのプレビュー URL が発行され、Workers Builds のチェックとして PR に出る。`wrangler.jsonc` の `previews` ブロックが空でも必須
- 404 は `not_found_handling: "404-page"` で `docs/404.html` を返す。ステータスは 404
- URL 末尾スラッシュや `.html` 省略の扱いは `html_handling` のデフォルト `auto-trailing-slash`。Pages と同じ挙動
- `observability` で Workers Logs、Traces、Issues を全量サンプリングで有効化している

## ローカル確認

```sh
npx wrangler dev
```

`http://localhost:8787` を開く。404 の挙動も本番と同じになる。wrangler なしで中身だけ見るなら `python3 -m http.server -d docs 8000` でもいい。

## 外部依存

`docs/index.html` が読み込んでいるもの。

- Google Fonts の Press Start 2P
- Google Analytics `UA-132382103-1`。Universal Analytics は既に計測停止済み
- Google Search Console の site verification meta タグ。消さないこと
- お問い合わせは Google Forms の iframe 埋め込み

## 編集時の注意

- 会社情報 `<dl>` は日本語と英語を `/` 区切りで併記する形式を維持する
- 配色は背景 `#000`、文字 `#00C400`
- ページ追加や大きな更新時は `docs/sitemap.xml` の `<loc>` と `<lastmod>` も更新する
- 新規ファイルは `docs/` 配下に置く。リポジトリ直下に置いたものは配信されない
- コードコメントは最小限
- UI 文言に括弧書きは極力使わない

## 既知の問題

手を入れる時はついでに直すか、別 PR に分けるか判断する。

- `index.html` に `<!doctype html>`、`<html>`、`<meta charset>`、viewport meta がない
- `<h1>SN</h2>` の閉じタグが不一致
- `404.html` は `<h1>404</h1>` だけでスタイルなし
