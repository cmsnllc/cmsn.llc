import { execFileSync } from "node:child_process";
import { basename, extname, resolve } from "node:path";
import { existsSync } from "node:fs";

const BUCKET = "cmsn-llc-media";
const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const [arg, keyArg] = process.argv.slice(2);
if (!arg) fail("usage: pnpm upload <file> [key]");
const file = resolve(process.env.INIT_CWD ?? process.cwd(), arg);
if (!existsSync(file)) fail(`ファイルがない: ${file}`);
const key = keyArg ?? basename(arg);
if (!/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(key)) fail(`key は英数字と . _ / - のみ: ${key}`);
const type = TYPES[extname(key).toLowerCase()];
if (!type) fail(`未対応の拡張子: ${extname(key)}`);

try {
  execFileSync(
    "pnpm",
    ["exec", "wrangler", "r2", "object", "put", `${BUCKET}/${key}`, "--file", file, "--content-type", type, "--remote"],
    { stdio: "inherit" },
  );
} catch (e) {
  process.exit((e as { status?: number }).status ?? 1);
}
console.log(`\n![](/media/${key})`);
