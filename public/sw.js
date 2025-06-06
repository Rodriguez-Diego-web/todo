const CACHE_NAME = 'plan-panda-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and requesting a page, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Push-Benachrichtigungen empfangen
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Neue Benachrichtigung',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/favicon-32x32.png',
      data: {
        url: data.url || '/',
        actionId: data.actionId
      },
      actions: data.actions || [],
      vibrate: [100, 50, 100],
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Plan Panda', options)
    );
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Push-Nachricht:', error);
  }
});

// Auf Klick auf Benachrichtigung reagieren
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const actionId = event.notification.data?.actionId;

  event.waitUntil(
    clients.matchAll({type: 'window'}).then((clientList) => {
      // Wenn bereits ein Fenster geöffnet ist, darauf fokussieren
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            actionId: actionId || event.action
          });
          return client.focus();
        }
      }
      // Sonst neues Fenster öffnen
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Wenn eine Benachrichtigung geschlossen wird
self.addEventListener('notificationclose', (event) => {
  console.log('Benachrichtigung geschlossen', event.notification);
});
