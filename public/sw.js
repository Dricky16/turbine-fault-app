self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Very basic fetch handler for PWA installability requirements
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline content here');
    })
  );
});
