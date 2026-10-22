import { execFileSync } from "node:child_process";
import { basename, extname, resolve } from "node:path";
import { existsSync } from "node:fs";

const BUCKET = "cmsn-llc-media";
const TYPES = {
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

const [arg, key = basename(arg ?? "")] = process.argv.slice(2);
const file = arg && resolve(process.env.INIT_CWD ?? process.cwd(), arg);
if (!file || !existsSync(file)) {
  console.error("usage: pnpm upload <file> [key]");
  process.exit(1);
}
if (!/^[A-Za-z0-9][A-Za-z0-9._\/-]*$/.test(key)) {
  console.error(`key は英数字と . _ / - のみ: ${key}`);
  process.exit(1);
}
const type = TYPES[extname(key).toLowerCase()];
if (!type) {
  console.error(`未対応の拡張子: ${extname(key)}`);
  process.exit(1);
}

try {
  execFileSync(
    "pnpm",
    ["exec", "wrangler", "r2", "object", "put", `${BUCKET}/${key}`, "--file", file, "--content-type", type, "--remote"],
    { stdio: "inherit" },
  );
} catch (e) {
  process.exit(e.status ?? 1);
}
console.log(`\n![](/media/${key})`);
