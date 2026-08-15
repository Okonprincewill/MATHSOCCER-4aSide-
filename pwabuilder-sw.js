// ============================================================
// MATHSOCCER SERVICE WORKER
// Package: com.okonprincewill.mathsoccer
// GitHub Pages:
// https://okonprincewill.github.io/MATHSOCCER-4aSide-/
// ============================================================

const CACHE_NAME = 'mathsoccer-v2';
const APP_ROOT = '/MATHSOCCER-4aSide-/';

const APP_SHELL = [
  APP_ROOT,
  APP_ROOT + 'index.html',
  APP_ROOT + 'manifest.json',
  APP_ROOT + 'pwabuilder-sw.js',
  APP_ROOT + 'icon-512.png',
  APP_ROOT + 'icon-192.png',
  APP_ROOT + 'screenshot1.png',
  APP_ROOT + 'screenshot2.png',
  APP_ROOT + 'screenshot3.png',
  APP_ROOT + 'screenshot4.png',
  APP_ROOT + 'explode.mp3',
  APP_ROOT + 'kick.mp3',
  APP_ROOT + 'ball.mp3',
  APP_ROOT + 'Mathsoccer_touch.mp3',
  APP_ROOT + 'cheer_goal.mp3',
  APP_ROOT + 'crowd_louds.mp3',
  APP_ROOT + 'Mathsoccer_cool.mp3',
  APP_ROOT + 'maths.mp3',
  APP_ROOT + 'disappointed.mp3'
];

// ============================================================
// INSTALL
// Cache the complete Mathsoccer app shell
// ============================================================

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching Mathsoccer app shell...');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('Mathsoccer app shell cached successfully.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache Mathsoccer app shell:', error);
        throw error;
      })
  );
});

// ============================================================
// ACTIVATE
// Remove old Mathsoccer caches
// ============================================================

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(
              cacheName =>
                cacheName.startsWith('mathsoccer-') &&
                cacheName !== CACHE_NAME
            )
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH
// ============================================================

self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // ----------------------------------------------------------
  // PAGE NAVIGATION
  // Network first, cached page as offline fallback
  // ----------------------------------------------------------

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache the latest successful page
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });

          return response;
        })
        .catch(() => {
          // No Internet: use cached index.html
          return caches.match(APP_ROOT + 'index.html');
        })
    );

    return;
  }

  // ----------------------------------------------------------
  // OTHER ASSETS
  // Cache first, then network
  // ----------------------------------------------------------

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(response => {

          // Cache successful same-origin responses
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, copy);
            });
          }

          return response;
        });
      })
  );
});