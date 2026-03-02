/**
 * Service Worker for Summit PWA
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'summit-v1';
const RUNTIME_CACHE = 'summit-runtime-v1';

// Files to cache on install
const PRECACHE_URLS = [
  '/',
  '/trips',
  '/education',
  '/offline.html',
];

// Install: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Use cache-first for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { destination, method } = request;

  // Skip non-GET requests
  if (method !== 'GET') {
    return;
  }

  // API requests: network-first
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: cache-first
  if (['style', 'script', 'image', 'font'].includes(destination)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  // Pages: network-first with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const cache = caches.open(RUNTIME_CACHE);
        cache.then((c) => c.put(request, response.clone()));
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || caches.match('/offline.html');
        });
      })
  );
});

// Background sync (future: offline message queue)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages());
  }
});

async function syncPendingMessages() {
  // Sync pending messages when back online
  const cache = await caches.open(RUNTIME_CACHE);
  // Implementation would queue messages and send when online
}

// Push notifications (future: booking reminders, messages)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'notification',
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
