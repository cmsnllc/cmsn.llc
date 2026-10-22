import type { Server } from "vike/types";
import { Hono } from "hono";
import vike from "@vikejs/hono";
import type { Bindings } from "./server/types";
import { media } from "./server/media";
import { sitemap } from "./server/sitemap";

const app = new Hono<{ Bindings: Bindings }>();

app.route("/", media);
app.route("/", sitemap);

// 拡張子付きのパスは静的ファイルとして ASSETS に渡す
app.use("*", async (c, next) => {
  if (!c.env?.ASSETS || !/\.[a-z0-9]+$/i.test(c.req.path)) return next();
  return c.env.ASSETS.fetch(c.req.raw);
});

vike(app);

export default { fetch: app.fetch } satisfies Server;
