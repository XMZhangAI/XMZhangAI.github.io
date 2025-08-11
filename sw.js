const CACHE_NAME = "xmzhang-v2.0";
const CACHE_ASSETS = [
  "./",
  "./index.html",
  "./profile.jpeg",
  "./manifest.webmanifest",
  "./CV.pdf",
  "./CV-icon.png",
  "./google-scholar-icon.png",
  "./github-icon.png",
  "./x-icon.png",
  "./linkedin-icon.png",
  "./email-icon.png",
  "./email-icon1.png"
];

// Enhanced install event with better error handling
self.addEventListener("install", evt => {
  console.log('[SW] Installing Service Worker');
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching assets');
        return cache.addAll(CACHE_ASSETS);
      })
      .catch(err => {
        console.error('[SW] Cache install failed:', err);
      })
  );
  self.skipWaiting();
});

// Enhanced activate event with cache cleanup
self.addEventListener("activate", evt => {
  console.log('[SW] Activating Service Worker');
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Enhanced fetch event with network-first strategy for dynamic content
self.addEventListener("fetch", evt => {
  if (evt.request.method !== "GET") return;
  
  // Network-first strategy for API calls and dynamic content
  if (evt.request.url.includes('api') || evt.request.url.includes('scholar.google.com')) {
    evt.respondWith(
      fetch(evt.request)
        .then(response => {
          // Clone the response as it can only be used once
          const responseClone = response.clone();
          
          // Cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(evt.request, responseClone);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(evt.request);
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  evt.respondWith(
    caches.match(evt.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(evt.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(evt.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(err => {
        console.error('[SW] Fetch failed:', err);
        
        // Return offline fallback for HTML pages
        if (evt.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});

// Background sync for analytics and metrics
self.addEventListener('sync', evt => {
  if (evt.tag === 'background-sync') {
    evt.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync analytics data, update metrics, etc.
    console.log('[SW] Background sync completed');
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}

// Push notifications for research updates
self.addEventListener('push', evt => {
  const options = {
    body: evt.data ? evt.data.text() : 'New research update available!',
    icon: './profile.jpeg',
    badge: './CV-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: './google-scholar-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: './x-icon.png'
      }
    ]
  };
  
  evt.waitUntil(
    self.registration.showNotification('Zhang Xuanming - Research Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', evt => {
  evt.notification.close();
  
  if (evt.action === 'explore') {
    evt.waitUntil(
      clients.openWindow('/')
    );
  }
});
