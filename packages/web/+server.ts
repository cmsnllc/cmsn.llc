import type { Server } from "vike/types";
import { Hono } from "hono";
import vike from "@vikejs/hono";
import type { Bindings } from "./server/types";
import { media } from "./server/media";
import { sitemap } from "./server/sitemap";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", async (c, next) => {
  if (!c.env?.ASSETS || !/\.[a-z0-9]+$/i.test(c.req.path) || c.req.path.startsWith("/media/")) return next();
  const res = await c.env.ASSETS.fetch(c.req.raw);
  if (res.status !== 404) return res;
  return next();
});

app.route("/", media);
app.route("/", sitemap);

vike(app);

export default { fetch: app.fetch } satisfies Server;
