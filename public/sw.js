const CACHE_NAME = 'memory-app-v1'
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json']

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the network response
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // Fall back to cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // For navigation requests, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      }),
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'Memory App'
  const options = {
    body: data.body || 'Vous avez des cartes à réviser !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'memory-review-reminder',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})
