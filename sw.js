// BlitzReport Service Worker v2.0 — cu Push Notifications
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const CACHE_NAME = 'blitzreport-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

firebase.initializeApp({
  apiKey: "AIzaSyA73UzN4bnco-Fo58sd5pGrb7ji5mchZGI",
  authDomain: "blitzflow-351d2.firebaseapp.com",
  databaseURL: "https://blitzflow-351d2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "blitzflow-351d2",
  storageBucket: "blitzflow-351d2.firebasestorage.app",
  messagingSenderId: "889558589771",
  appId: "1:889558589771:web:d76128669072390e4d08ce"
});

const messaging = firebase.messaging();

// Primeste notificari cand aplicatia e INCHISA
messaging.onBackgroundMessage(function(payload) {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'BlitzReport', {
    body: body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'blitzreport-notif',
    renotify: true
  });
});

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
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
      }).catch(() => caches.match('/index.html'));
    })
  );
});
