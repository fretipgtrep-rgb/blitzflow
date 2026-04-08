// BlitzReport Service Worker v6
const CACHE_NAME = 'blitzreport-v6';
const ASSETS = ['/blitzflow/', '/blitzflow/index.html', '/blitzflow/manifest.json'];

self.addEventListener('push', event => {
  // Determina mesajul in functie de ora
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  
  let title = '📊 BlitzReport';
  let body = 'Ai un reminder nou!';

  if (h === 8 && m <= 35) { title = '🌅 BlitzReport — Planificare'; body = 'Nu uita să completezi planificarea! Se închide la 09:00.'; }
  else if (h === 8 && m <= 50) { title = '⏰ BlitzReport — Planificare'; body = 'Planificarea se închide în 15 minute! (09:00)'; }
  else if (h === 8) { title = '🚨 BlitzReport — Urgent!'; body = 'Planificarea se închide în 5 minute! Completează acum!'; }
  else if (h === 17) { title = '🌆 BlitzReport — Execuție'; body = 'Sesiunea de execuție s-a deschis! Completează până la 21:00.'; }
  else if (h === 20) { title = '⏰ BlitzReport — Execuție'; body = 'Execuția se închide în 15 minute! (21:00)'; }
  else if (h === 21) { title = '📊 BlitzReport — Raport Săptămânal'; body = 'E vineri! Nu uita să trimiți raportul săptămânal pe grup.'; }

  // Incearca sa citeasca payload daca exista
  try {
    if (event.data) {
      const text = event.data.text();
      if (text && text.includes('"title"')) {
        const data = JSON.parse(text);
        if (data.title) title = data.title;
        if (data.body) body = data.body;
      }
    }
  } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
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
