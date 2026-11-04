// public/sw.js - Service Worker for Installable PWA & Offline Support
const CACHE_NAME = 'jadwalin-pwa-v2'

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon-32x32.png',
  './apple-touch-icon.png',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
  './assets/logo/logo_jadwalin.webp',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Cache prefetch error for:', url, err)
          })
        )
      )
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Only handle http/https requests from our origin
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, and optionally update in background
        return cachedResponse
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // If network failed and HTML navigation requested, return root index.html
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html') || caches.match('/')
          }
        })
    })
  )
})
