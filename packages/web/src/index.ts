interface Env {
  ASSETS: Fetcher;
  MEDIA: R2Bucket;
}

const MEDIA_PREFIX = "/media/";

const hasBody = (o: R2Object): o is R2ObjectBody => "body" in o;

async function serveMedia(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  let key: string;
  try {
    key = decodeURIComponent(new URL(request.url).pathname.slice(MEDIA_PREFIX.length));
  } catch {
    return env.ASSETS.fetch(request);
  }
  const object = key ? await env.MEDIA.get(key, { onlyIf: request.headers }) : null;
  if (!object) return env.ASSETS.fetch(request);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=86400");

  if (!hasBody(object)) return new Response(null, { status: 304, headers });

  const response = new Response(request.method === "HEAD" ? null : object.body, { headers });
  if (request.method === "GET") ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}

export default {
  fetch(request, env, ctx) {
    if (new URL(request.url).pathname.startsWith(MEDIA_PREFIX)) {
      return serveMedia(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
