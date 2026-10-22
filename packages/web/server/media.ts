import { Hono } from "hono";
import type { Bindings } from "./types";

const hasBody = (o: R2Object): o is R2ObjectBody => "body" in o;

export const media = new Hono<{ Bindings: Bindings }>();

media.all("/media/*", async (c) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    return c.text("Method Not Allowed", 405, { Allow: "GET, HEAD" });
  }
  const cache = caches.default;
  const cached = await cache.match(c.req.raw);
  if (cached) return cached;

  let key: string;
  try {
    key = decodeURIComponent(c.req.path.slice("/media/".length));
  } catch {
    return c.notFound();
  }
  const object = key ? await c.env.MEDIA.get(key, { onlyIf: c.req.raw.headers }) : null;
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400");

  if (!hasBody(object)) return new Response(null, { status: 304, headers });

  const response = new Response(c.req.method === "HEAD" ? null : object.body, { headers });
  if (c.req.method === "GET") c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()));
  return response;
});
