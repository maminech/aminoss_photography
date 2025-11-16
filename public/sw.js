// Service Worker for Innov8 Admin PWA
// Works on Android, iOS Safari 11.3+, Chrome, Firefox, Edge
// Version: 2.0 - Professional Enhanced Edition
const CACHE_NAME = 'Innov8-admin-v3';
const RUNTIME_CACHE = 'Innov8-admin-runtime-v3';
const API_CACHE = 'Innov8-admin-api-v3';

const urlsToCache = [
  '/admin/dashboard',
  '/admin/invoices',
  '/admin/bookings',
  '/admin/messages',
  '/admin/clients',
  '/admin/calendar',
  '/admin/settings',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Admin Service Worker installing... v2.0');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Caching admin pages');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('❌ Cache error:', err);
        });
      }),
      caches.open(RUNTIME_CACHE),
      caches.open(API_CACHE),
    ])
  );
  self.skipWaiting();
});

// Fetch event - Smart caching for admin
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache GET requests only
          if (request.method === 'GET' && response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('📡 API offline, serving cached data:', url.pathname);
          return caches.match(request);
        })
    );
    return;
  }

  // Admin pages - Network first, cache fallback
  if (url.pathname.startsWith('/admin')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('📡 Offline mode, serving cached page:', url.pathname);
          return caches.match(request).then((cached) => {
            return cached || caches.match('/admin/dashboard');
          });
        })
    );
    return;
  }

  // Default: Cache first
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Admin Service Worker activating... v2.0');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName) && cacheName.startsWith('Innov8-admin')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Admin Service Worker activated successfully!');
    })
  );
  
  // Take control immediately (iOS Safari compatibility)
  return self.clients.claim();
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification event - Enhanced notification display
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');
  
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'New Notification',
      body: event.data.text(),
    };
  }
  
  const options = {
    body: data.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [200, 100, 200, 100, 200], // Professional vibration pattern
    data: {
      url: data.url || '/admin/dashboard',
      timestamp: Date.now(),
      type: data.type || 'general',
    },
    actions: data.actions || [
      { action: 'open', title: 'View', icon: '/icon-192.svg' },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: data.tag || `notification-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    timestamp: Date.now(),
  };

  // Add custom styling based on notification type
  if (data.type === 'booking') {
    options.badge = '📅';
  } else if (data.type === 'message') {
    options.badge = '💬';
  } else if (data.type === 'payment') {
    options.badge = '💰';
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - Enhanced interaction handling
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open the URL from notification data
  const urlToOpen = event.notification.data.url || '/admin/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            console.log('✅ Focusing existing window');
            return client.focus().then(() => {
              // Send message to client to navigate
              client.postMessage({
                type: 'NAVIGATE',
                url: urlToOpen,
              });
              return client;
            });
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          console.log('🆕 Opening new window');
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close event (analytics/cleanup)
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
});

