# cmsn.llc

## 個別ページの追加

`pages/_template.md` をコピーして `pages/<slug>.md` を作ると `https://cmsn.llc/<slug>/` で公開される。

```md
---
title: ページタイトル
description: 検索結果や SNS に出る説明文
date: 2026-10-22
---

本文を Markdown で書く。
```

画像は `npm run upload -- <file>` で R2 に上げて、出てきた `![](/media/...)` を本文に貼る。

ローカル確認は `npm install` してから `npx wrangler dev`。詳細は [AGENTS.md](AGENTS.md)。
