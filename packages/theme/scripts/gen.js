import { mkdir, readFile, writeFile } from "node:fs/promises";

const tokens = JSON.parse(await readFile(new URL("../tokens.json", import.meta.url), "utf8"));
const firstTheme = tokens.color.themes[0].id;

const rem = (v) => (typeof v === "string" && v.endsWith("px") ? `${parseFloat(v) / 16}rem` : v);
const colorValue = (v) => (typeof v === "string" ? v : v[firstTheme]);

const lines = [];
const section = (title) => lines.push("", `  /* ${title} */`);

section("color");
for (const t of tokens.color.tokens) lines.push(`  --color-${t.name}: ${colorValue(t.value)};`);

section("font");
for (const [name, value] of Object.entries(tokens.type.families)) lines.push(`  --font-${name}: ${value};`);

section("text");
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    lines.push(`  --text-${s.name}: ${rem(s.fontSize)};`);
    if (s.lineHeight != null) lines.push(`  --text-${s.name}--line-height: ${rem(s.lineHeight)};`);
    if (s.letterSpacing != null) lines.push(`  --text-${s.name}--letter-spacing: ${s.letterSpacing};`);
    if (s.fontWeight != null) lines.push(`  --text-${s.name}--font-weight: ${s.fontWeight};`);
  }
}

const css = `/* packages/theme/tokens.json から生成。直接編集しない。
   spacing / radius / border は Tailwind 既定の語彙と数字の意味がぶつかるので出力しない。対応は guide.md。 */
@theme static {${lines.join("\n")}
}
`;

await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/theme.css", import.meta.url), css);
console.log("generated packages/theme/dist/theme.css");
