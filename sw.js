const CACHE_NAME = "armario-cache-v3";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./rembg-assets/ort.wasm.bundle.min.mjs",
  "./rembg-assets/ort-wasm-simd-threaded.mjs",
  "./rembg-assets/ort-wasm-simd-threaded.wasm",
  "./rembg-assets/u2netp.onnx",
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
  event.respondWith(
    fetch(event.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
