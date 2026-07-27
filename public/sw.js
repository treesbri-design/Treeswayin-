// FaithPath AI Offline Service Worker
const CACHE_NAME = 'faithpath-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Install event: Cache core app shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell assets & offline scriptures...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Static pre-cache failed non-critically:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first with Cache fallback strategy
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or Chrome extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, update the cache asynchronously
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        console.log('[Service Worker] Network failed, searching cache for:', event.request.url);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, return cached index.html
        if (event.request.mode === 'navigate') {
          const indexFallback = await caches.match('/index.html') || await caches.match('/');
          if (indexFallback) return indexFallback;
        }

        // Return a clean offline JSON response if it's an API route
        if (event.request.url.includes('/api/')) {
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'FaithPath AI is operating in Offline Mode. Core Scriptures, Devotionals, and Prayer Journal remain available.',
              scriptureReferences: ['Romans 8:28', 'Psalm 23:1-6']
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200
            }
          );
        }

        return new Response('Offline - FaithPath AI Content Cached', { status: 503 });
      })
  );
});
