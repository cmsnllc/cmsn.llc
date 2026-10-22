# cmsn.llc

pnpm workspaces のモノレポ。サイト本体は `packages/web`。

## 個別ページの追加

`packages/web/pages/_template.md` をコピーして `packages/web/pages/<slug>.md` を作ると `https://cmsn.llc/<slug>/` で公開される。

```md
---
title: ページタイトル
description: 検索結果や SNS に出る説明文
date: 2026-10-22
---

本文を Markdown で書く。
```

画像は `pnpm upload <file>` で R2 に上げて、出てきた `![](/media/...)` を本文に貼る。

ローカル確認は `pnpm install` してから `pnpm dev`。詳細は [AGENTS.md](AGENTS.md)。
