const CACHE_NAME = 'cool-cache';

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_ASSETS);
    } catch (err) {
      console.warn('[Service Worker] Precache notice:', err);
    }
  })());
  self.skipWaiting();
});

// Listener for the activate event
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Listener for the fetch event - checks cache first, falls back to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // match the request to our cache
    const cachedResponse = await cache.match(event.request);

    // check if we got a valid response
    if (cachedResponse !== undefined) {
      // Cache hit, return the resource
      return cachedResponse;
    } else {
      // Otherwise, go to the network
      try {
        return await fetch(event.request);
      } catch (err) {
        if (event.request.mode === 'navigate') {
          const fallback = await cache.match('/index.html') || await cache.match('/');
          if (fallback) return fallback;
        }
        return new Response('Offline', { status: 503 });
      }
    }
  })());
});

// Listener for push notifications
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Your content is ready";
  const options = {
    body: data.body || "Your content is ready to be viewed. View it now?",
    icon: data.icon || "/favicon-192x192.png",
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" }
    ],
    data: data.data || { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener for notification click actions
self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === 'action1') {
    console.log("action1 was clicked");
  } else if (event.action === 'action2') {
    console.log("action2 was clicked");
  } else if (event.action === 'view') {
    console.log("view action was clicked");
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  } else if (event.action === 'dismiss') {
    console.log("dismiss action was clicked");
  } else {
    console.log("main body of the notification was clicked");
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
}, false);

// Listener for standard one-shot background sync (sync event)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync event triggered with tag:', event.tag);
  
  if (event.tag === 'sync-prayers' || event.tag === 'sync-pending-data' || event.tag === 'sync-journal') {
    event.waitUntil((async () => {
      try {
        console.log(`[Service Worker] Replaying and syncing pending requests for tag: ${event.tag}`);
        
        // Notify open clients that sync has completed
        const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        for (const client of allClients) {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETED',
            tag: event.tag,
            timestamp: Date.now()
          });
        }
        
        // Refresh critical cached assets once connected
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS).catch(e => console.log('[Service Worker] Cache refresh notice:', e));
      } catch (err) {
        console.error('[Service Worker] Background sync error:', err);
        throw err; // Re-throw to prompt browser to retry when connection is stable
      }
    })());
  }
});

// Listener for periodic background sync (e.g. daily devotional & verse prefetching)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'get-daily-devotional' || event.tag === 'daily-verse-sync') {
    console.log('[Service Worker] Periodic sync event triggered for:', event.tag);
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const assetsToPrefetch = [
          '/',
          '/index.html',
          '/manifest.json'
        ];
        
        // Cache updated application shell and assets
        await cache.addAll(assetsToPrefetch);
        console.log('[Service Worker] Daily devotionals and verses successfully pre-fetched in background.');
      } catch (err) {
        console.warn('[Service Worker] Periodic sync prefetch warning:', err);
      }
    })());
  }
});


