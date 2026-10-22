import { execFileSync } from "node:child_process";
import { basename, extname } from "node:path";
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

const [file, key = basename(file ?? "")] = process.argv.slice(2);
if (!file || !existsSync(file)) {
  console.error("usage: npm run upload -- <file> [key]");
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

execFileSync(
  "npx",
  ["wrangler", "r2", "object", "put", `${BUCKET}/${key}`, "--file", file, "--content-type", type, "--remote"],
  { stdio: "inherit" },
);
console.log(`\n![](/media/${key})`);
