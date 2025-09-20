self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("bible-app-v1").then(cache => {
      return cache.addAll([
        "/",
        "index.html",
        "css/styles.css",
        "app.js",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
});