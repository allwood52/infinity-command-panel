const CACHE = "orders-cache-v2";
const FILES = [
  "index.html",
  "style.css",
  "app.js",
  "meta-table.js",
  "manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});