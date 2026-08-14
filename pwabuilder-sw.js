// ============================================================
// MATHSOCCER SERVICE WORKER
// Package: com.okonprincewill.mathsoccer
// GitHub Pages:
// https://okonprincewill.github.io/MATHSOCCER-4aSide-/
// ============================================================

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js'
);

const CACHE = 'mathsoccer-cache-v2';
const OFFLINE_FALLBACK = './index.html';

// ------------------------------------------------------------
// INSTALL
// ------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        return cache.addAll([
          './',
          './index.html',
          './manifest.json',
          './icon-192.png',
          './icon-512.png'
        ]);
      })
      .catch((error) => {
        console.error(
          'Mathsoccer cache installation failed:',
          error
        );
      })
  );
});

// ------------------------------------------------------------
// ACTIVATE
// ------------------------------------------------------------

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ------------------------------------------------------------
// MESSAGE
// ------------------------------------------------------------

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ------------------------------------------------------------
// NAVIGATION PRELOAD
// ------------------------------------------------------------

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// ------------------------------------------------------------
// FETCH
// ------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const preloadResponse = await event.preloadResponse;

        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);

        return networkResponse;

      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResponse = await cache.match(OFFLINE_FALLBACK);

        if (cachedResponse) {
          return cachedResponse;
        }

        return new Response(
          'Mathsoccer is currently offline.',
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          }
        );
      }
    })()
  );
});