/**
 * Service Worker: macht die App offline nutzbar. Alles bleibt lokal; es werden
 * nur die eigenen Seiten und Assets (gleiche Origin, GET) zwischengespeichert.
 *
 * - Seitenaufrufe: zuerst Netzwerk (aktueller Stand), offline aus dem Cache.
 * - Gehashte Vite-Assets (/assets/): Cache zuerst, sie ändern sich nie.
 * - Sonstiges (Icons, Fonts, SSI-Partials): Cache sofort, im Hintergrund erneuern.
 */
const CACHE = 'playlist-generator-v1'
const SCOPE = new URL(self.registration.scope).pathname
const SHELL = SCOPE + 'app'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([SCOPE, SHELL]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

async function store(request, response) {
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    return await store(request, await fetch(request))
  } catch (err) {
    const cached =
      (await caches.match(request, { ignoreSearch: true })) || (await caches.match(SHELL))
    if (cached) return cached
    throw err
  }
}

async function cacheFirst(request) {
  return (await caches.match(request)) || store(request, await fetch(request))
}

async function staleWhileRevalidate(event) {
  const cached = await caches.match(event.request)
  const update = fetch(event.request).then((response) => store(event.request, response))
  if (cached) {
    event.waitUntil(update.catch(() => undefined))
    return cached
  }
  return update
}

// Die Seite meldet nach der Registrierung, was sie schon geladen hat (JS, CSS,
// Fonts); diese Anfragen liefen noch nicht über den Service Worker.
self.addEventListener('message', (event) => {
  const { type, urls } = event.data || {}
  if (type !== 'cache-urls' || !Array.isArray(urls)) return
  const own = urls.filter((url) => new URL(url, self.location.href).origin === self.location.origin)
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          own.map((url) =>
            cache.match(url).then((hit) => hit || cache.add(url).catch(() => undefined)),
          ),
        ),
      ),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else if (url.pathname.startsWith(SCOPE + 'assets/')) {
    event.respondWith(cacheFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(event))
  }
})
