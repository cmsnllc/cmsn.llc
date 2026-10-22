# AGENTS.md

カミング・スーン合同会社 / Coming Soon LLC のコーポレートサイト https://cmsn.llc のリポジトリ。

## 構成

ビルド工程なしの静的サイト。パッケージマネージャ、依存、テスト、lint は存在しない。

```
docs/
  index.html    トップページ。CSS は <style> にインライン
  404.html      404 ページ
  sitemap.xml   サイトマップ
netlify.toml    Netlify 設定。未定義パスを /404.html に流す
README.md       Netlify デプロイステータスバッジのみ
```

## デプロイ

- Netlify と Cloudflare Pages の両方が連携している。本番がどちらかはリポジトリからは判別できない
  - Netlify: サイト名 `cmsn`。README のバッジ参照
  - Cloudflare Pages: プロジェクト名 `cmsn-llc`。PR ごとに `<branch>.cmsn-llc.pages.dev` へプレビューがデプロイされ、bot が PR にコメントする
- `netlify.toml` に publish ディレクトリ指定はなく、各サービス側の設定で `docs/` を配信している想定
- デフォルトブランチは `master`。push で自動デプロイされる

## ローカル確認

```sh
python3 -m http.server -d docs 8000
```

`http://localhost:8000` を開く。404 リダイレクトは Netlify 固有なのでローカルでは再現しない。

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
