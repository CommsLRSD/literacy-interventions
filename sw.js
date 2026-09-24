// ============================================
// Literacy Interventions — Service Worker
// ============================================
// A service worker is required for browsers (Chrome, Edge, Android) to treat
// the site as installable and fire the `beforeinstallprompt` event.
//
// Strategy: network-first with a cache fallback. Content is always fresh when
// the user is online, and the last successful response is served if the
// network is unavailable.

const CACHE_NAME = 'literacy-interventions-v2';

// Minimal shell cached up front so the app can still start while offline.
const PRECACHE_URLS = [
    './',
    'index.html',
    'styles.css',
    'auth-gate.js',
    'app.js',
    'translations.js',
    'manifest.webmanifest'
];

// Pre-cache the app shell as soon as the worker installs.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            // Never block installation if a single asset fails to cache.
            .catch(() => undefined)
            .then(() => self.skipWaiting())
    );
});

// Remove caches from previous versions of the worker.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Network-first for same-origin GET requests; fall back to the cache offline.
self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;
    if (new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                // Store a copy of successful responses for offline use.
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return response;
            })
            .catch(() => caches.match(request).then(cached => {
                if (cached) return cached;
                // Navigations fall back to the cached app shell.
                if (request.mode === 'navigate') return caches.match('index.html');
                return Response.error();
            }))
    );
});
