/* Service worker — coquille de l'app en cache (hors-ligne) + cache runtime
   pour l'API et les images de recettes. */
const VERSION = "mijo-v4";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/ingredients-fr.js",
  "./js/scan.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // API recettes/images + bibliothèques CDN : stale-while-revalidate
  if (url.hostname.includes("themealdb.com") || url.hostname.includes("jsdelivr.net")) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Coquille / même origine : cache d'abord, réseau en repli
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => caches.match("./index.html"))
      )
    );
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response(JSON.stringify({ meals: null }), { headers: { "Content-Type": "application/json" } });
}
