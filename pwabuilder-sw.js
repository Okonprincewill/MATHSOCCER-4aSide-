// ============================================================
// MATHSOCCER SERVICE WORKER - CORRECTED - iPhone Compliant
// GitHub: Okonprincewill/MATHSOCCER-4aSide-
// Base64 sounds are inside index.html - no need to list them
// ============================================================

const CACHE_NAME = 'mathsoccer-v15-iphone';
const APP_ROOT = '/MATHSOCCER-4aSide-/';

// For GitHub Pages - use APP_ROOT
// For local / root domain - change to './'
const FILES_TO_CACHE = [
  APP_ROOT,
  APP_ROOT + 'index.html',
  APP_ROOT + 'manifest.json',
  APP_ROOT + 'icon-72x72.png',
  APP_ROOT + 'icon-96x96.png',
  APP_ROOT + 'icon-128x128.png',
  APP_ROOT + 'icon-144x144.png',
  APP_ROOT + 'icon-152x152.png',
  APP_ROOT + 'icon-192x192.png',
  APP_ROOT + 'icon-384x384.png',
  APP_ROOT + 'icon-512x512.png',
  APP_ROOT + 'icon-512.png'
];

// ============================================================
// INSTALL - iPhone safe with individual caching
// ============================================================
self.addEventListener('install', event => {
  console.log('📦 Installing MathSoccer v15...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('📦 Caching core files...');
      // Cache each file individually so 1 missing icon doesn't break install on iPhone
      for (const file of FILES_TO_CACHE) {
        try {
          await cache.add(file);
          console.log(`  ✅ ${file.split('/').pop()}`);
        } catch (e) {
          console.log(`  ⚠ ${file.split('/').pop()} - not cached (${e.message})`);
        }
      }
      console.log('✅ Install complete - base64 sounds are inside index.html');
      return self.skipWaiting();
    })
  );
});

// ============================================================
// ACTIVATE - Clean old caches
// ============================================================
self.addEventListener('activate', event => {
  console.log('🚀 Activating v15...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('mathsoccer-') && name !== CACHE_NAME)
          .map(name => {
            console.log(`🗑 Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('✅ Activated!');
      return self.clients.claim();
    })
  );
});

// ============================================================
// MESSAGE - Skip waiting
// ============================================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================
// FETCH - iPhone compliant strategy
// ============================================================
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Only handle GET - critical for iPhone
  if (request.method !== 'GET') return;

  // HTML navigation - network first, fallback to cache (always works offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          // Offline - return cached index.html (which contains base64 sounds)
          const cached = await caches.match(APP_ROOT + 'index.html') || await caches.match(APP_ROOT);
          if (cached) return cached;
          return new Response('<h1>MathSoccer Offline - Go online once to cache</h1>', {
            headers: { 'Content-Type': 'text/html' },
            status: 503
          });
        })
    );
    return;
  }

  // All other assets - cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      
      return fetch(request).then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    }).catch(() => {
      // Fallback for images - prevents broken image icons on iPhone
      if (request.url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
        return caches.match(APP_ROOT + 'icon-512.png');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

console.log('⚽ MathSoccer SW v15 loaded - base64 sounds inside index.html');
