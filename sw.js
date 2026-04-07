// BlitzReport Service Worker v3.1
const CACHE_NAME = 'blitzreport-v4';
const ASSETS = ['/blitzflow/', '/blitzflow/index.html', '/blitzflow/manifest.json'];

self.addEventListener('push', event => {
  let data = { title: '📊 BlitzReport', body: 'Ai un reminder nou!' };
  try { 
    if (event.data) {
      const text = event.data.text();
      if (text) data = JSON.parse(text);
    }
  } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'BlitzReport', {
      body: data.body || '',
      icon: '/blitzflow/icon-192.png',
      badge: '/blitzflow/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'blitzreport-notif',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/blitzflow/'));
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(e => console.log('Cache error:', e))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/blitzflow/index.html'));
    })
  );
});
