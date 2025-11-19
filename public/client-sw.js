// Service Worker for Innov8 Production PWA
// Works on Android, iOS Safari 11.3+, Chrome, Firefox, Edge
// Version: 2.0 - Professional Enhanced Edition
const CACHE_NAME = 'Innov8-public-v2';
const RUNTIME_CACHE = 'Innov8-runtime-v2';
const IMAGE_CACHE = 'Innov8-images-v2';

const urlsToCache = [
  '/',
  '/gallery',
  '/about',
  '/services',
  '/booking',
  '/contact',
  '/offline',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('✨ Service Worker installing... v2.0');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('❌ Cache addAll error:', err);
        });
      }),
      caches.open(RUNTIME_CACHE),
      caches.open(IMAGE_CACHE),
    ])
  );
  self.skipWaiting();
});

// Fetch event - Smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip admin, client portal, and API URLs
  if (url.pathname.startsWith('/admin') || 
      url.pathname.startsWith('/client/dashboard') ||
      url.pathname.startsWith('/api/')) {
    return;
  }

  // Images - Cache first strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            console.log('🖼️ Serving cached image:', url.pathname);
            return cached;
          }
          return fetch(request).then((response) => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type !== 'opaque') {
              // Clone immediately before any operations
              const responseToCache = response.clone();
              cache.put(request, responseToCache).catch(() => {
                // Silently fail for large images or quota issues
              });
            }
            return response;
          }).catch((err) => {
            console.log('Image fetch failed:', url.pathname);
            throw err;
          });
        });
      })
    );
    return;
  }

  // Static assets - Cache first
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          // Only cache successful, non-opaque responses
          if (response && response.status === 200 && response.type !== 'opaque') {
            // Clone immediately before caching
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache).catch(() => {
                // Silently fail cache writes
              });
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Don't cache non-successful responses or opaque responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        
        // Clone BEFORE any other operations
        const responseToCache = response.clone();
        
        // Cache in background (don't await)
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache).catch((err) => {
            // Silently fail cache writes (e.g., for large responses)
            console.log('Cache write skipped:', url.pathname);
          });
        });
        
        return response;
      })
      .catch(() => {
        console.log('📡 Network failed, serving from cache:', url.pathname);
        // Fallback to cache if network fails
        return caches.match(request).then((cached) => {
          return cached || caches.match('/offline');
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating... v2.0');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName) && cacheName.startsWith('Innov8-')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated successfully!');
    })
  );
  
  // Take control of all pages immediately (iOS Safari needs this)
  return self.clients.claim();
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline form submissions (if supported)
if (self.registration.sync) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-bookings') {
      event.waitUntil(syncBookings());
    }
  });
}

async function syncBookings() {
  // Sync any pending bookings when back online
  console.log('📤 Syncing pending bookings...');
}

