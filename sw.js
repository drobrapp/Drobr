const CACHE_NAME = "armario-cache-v3";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./rembg-assets/ort.wasm.min.js",
  "./rembg-assets/ort-wasm-simd.wasm",
  "./rembg-assets/isnet-general-use.quant.onnx",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Red primero, caché como respaldo solo si no hay conexión: así cualquier
// actualización que subas se ve en cuanto se reabre la app, sin reinstalar nada.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const canCache = req.method === "GET" && req.url.startsWith("http");
  event.respondWith(
    fetch(req).then((res) => {
      if (canCache) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
