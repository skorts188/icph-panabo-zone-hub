/**
 * ICPH HUB SERVICE WORKER V2
 * Engineered by Infra-Shadow & Logic Core
 * Standard: TOP 1 IN THE COUNTRY
 */

const CACHE_NAME = 'icph-v37.6';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/assets/logo.png',
  '/assets/cover.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('⚡ ICPH CYBER-CORE: SW ACTIVE');
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (e) => {
  // Supabase & dynamic calls should always be fresh
  if (e.request.url.includes('supabase.co') || e.request.url.includes('cdnjs')) return;
  
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

// 🛡️ PUSH NOTIFICATION PROTOCOL (Infra-Shadow)
self.addEventListener('push', (event) => {
    let data = { title: 'ICPH HUB', body: 'New community update!' };
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'assets/logo.png',
        badge: 'assets/logo.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/index.html' },
        actions: [
            { action: 'open', title: 'VIEW NOW' },
            { action: 'close', title: 'DISMISS' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const url = event.notification.data.url;
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
