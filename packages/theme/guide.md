<!-- このファイルとトークンの正は repo の packages/theme。デザインシステム Artifact https://claude.ai/artifact/2RQNEJ6wiGAm2qgi7XTD8T の README.md と tokens.json はここから写す。Artifact 側を直接直さない。 -->

カミング・スーン合同会社 / Coming Soon LLC のサイト https://cmsn.llc と、今後そこに足すページのためのルール。黒い画面に緑の燐光文字が光る、古い端末とファミコンの間くらいの世界観をすべての画面で守る。

## 文言

- 日本語と英語を `日本語 / English` の順で `/` 区切りに併記する。会社情報も見出しも同じ形式
- 文体は常体で短く。敬語の挨拶文や煽り文句は入れない
- UI 文言に括弧書きは使わない。補足は別の行か `/` 区切りで書く
- 絵文字は使わない。強調したいときは `phosphor` 地の反転表示で示す
- 実例: `会社名 / Name`、`お問い合わせ / Contact`、`資本金 / Capital`

## 色

- 画面は `bg` の黒一色。テーマは Terminal の 1 つだけで、ライトモードは持たない
- 文字、見出し、リンク、罫線の主役は `phosphor`。補足は `phosphor-muted`、枠線は `line`、装飾だけの罫線は `line-faint`
- 反転表示や主ボタンは `phosphor` 地に `on-phosphor` 文字
- `amber` は警告とエラー専用。緑の画面で唯一の別色なので、状態を表すときだけ使い、必ず文言を添える
- `embed-bg` の白は外部埋め込みの下地だけ。自前の部品には白を使わない
- グラデーションと影は使わない。面の差は `surface-raised` の一段だけ

## 文字

- ロゴと英字の見出しは `display` ファミリーの Press Start 2P。日本語グリフを持たないので日本語は絶対に入れない
- 日本語を含む文字はすべて `body` ファミリーの M PLUS 1 Code。等幅で端末らしさを保ちつつ日本語が読める
- スタイルは `wordmark` `display` `label` `heading` `info` `body` `small` の 7 つ。新しいサイズを足す前にこの中から選ぶ
- 本文は `body` スタイルの 16px / 1.75。1 行 40 字前後に収める
- フォントは Google Fonts から読み込む。`<link href="https://fonts.googleapis.com/css2?family=M+PLUS+1+Code:wght@400;700&family=Press+Start+2P&display=swap" rel="stylesheet">`

## 余白とレイアウト

- 余白は 1rem = 16px を単位にした `space-*` から選ぶ。名前の数字は rem 倍率。Tailwind のクラスは 4px 単位なので `space-1` は `p-4`、`space-5` は `p-20` のように 4 倍した数字で書く
- 既存トップページは `space-10` `space-5` `space-20` `space-30` の大きな余白で、ヒーローを単独で見せる構成
- 画面端のガターは最低 `space-1`
- 横幅 640px 以下では 2 列の定義リストを 1 列に落とす

## 形

- 角はすべて `radius-0` の直角。ピクセルの世界観なので角丸は使わない。Tailwind では `rounded-*` を付けない
- 枠線とフォーカスリングは `border-pixel` の 2px。1px の極細線は使わない。Tailwind では `border-2` `outline-2`
- フォーカスは `phosphor` の実線アウトラインを `border-pixel` 分離して描く

## アイコンと画像

- ロゴ画像とアイコンセットは存在しない。ロゴは Wordmark の文字組みで表す
- アイコンが必要になったら 16px グリッドのピクセルアイコンを 1 色 `phosphor` で作る

## 部品

- Wordmark: トップの CM / SN
- InfoList: 会社情報の定義リスト
- SectionHeading: 日英併記のセクション見出し
- TextLink: 本文中のリンク
- EmbedFrame: Google Forms の埋め込み枠
- Button: 今後のフォーム用に足したボタン。既存サイトにはない

サイトでは部品を Tailwind のクラスで組む。実例は `packages/web/docs/index.html` と `packages/web/layouts/page.html`。デザインシステムの部品プレビューは `cm-` 接頭辞のクラスと `components/bundle.css` で描いているが、これはデザインシステム側だけのもの。
