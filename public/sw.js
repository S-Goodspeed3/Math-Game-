const CACHE = "last-week-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const base = new URL("./", self.location.href);
      const response = await fetch(base, { cache: "reload" });
      if (!response.ok) throw Error("Shell unavailable");
      const html = await response.text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map((m) => new URL(m[1], base))
        .filter((u) => u.origin === base.origin);
      await cache.put(
        base,
        new Response(html, { headers: { "Content-Type": "text/html" } }),
      );
      await cache.addAll([
        ...new Set([
          ...assets.map((u) => u.href),
          new URL("icon-192.png", base).href,
          new URL("icon-512.png", base).href,
        ]),
      ]);
    })(),
  );
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const c = await caches.open(CACHE);
          await c.put(event.request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate")
          return (
            (await caches.match(new URL("./", self.location.href))) ||
            Response.error()
          );
        return Response.error();
      }
    })(),
  );
});
