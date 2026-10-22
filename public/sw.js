/* BuyWater Tamale – Service Worker */
const CACHE = "buywater-v4";
const PRECACHE = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never intercept API – always network
  if (url.pathname.startsWith("/api/")) return;

  // Navigations & Next.js assets: network-first so admin content updates show immediately
  const isNavigate = req.mode === "navigate";
  const isNextAsset =
    url.pathname.startsWith("/_next/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");

  if (isNavigate || isNextAsset) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Do not cache HTML navigations – always prefer live server response
          if (!isNavigate && res.ok && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/") || Response.error())
        )
    );
    return;
  }

  // Other static assets: network-first with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
