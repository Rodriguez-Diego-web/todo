const CACHE_NAME = 'plan-panda-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.webmanifest'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
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

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
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
      icon: data.icon || '/logo.png',
      badge: data.badge || '/favicon-32x32.png',
      data: {
        url: data.url || '/',
        actionId: data.actionId
      },
      actions: data.actions || []
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
