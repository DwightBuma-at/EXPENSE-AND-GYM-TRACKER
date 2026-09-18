const CACHE_NAME = 'fit-expense-tracker-v13';
const PRECACHE_URLS = [
  './',
  './index.html',
  './gym.html',
  './chestandback.html',
  './arm.html',
  './leg.html',
  './expense.html',
  './history.html',
  './logs.html',
  './manifest.json',
  './assets/icon.svg',
  './assets/js/tailwind.min.js',
  './assets/js/lucide.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(event.request, { ignoreSearch: true }).then((page) => {
              return page || caches.match('./index.html');
            });
          }
        });
    })
  );
});
