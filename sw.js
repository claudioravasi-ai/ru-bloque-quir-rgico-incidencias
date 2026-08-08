/* Service worker de HRU Quirófanos.
 *
 * Objetivo: que la app abra siempre, incluso sin conexión, en cualquier
 * computadora o teléfono. Solo cachea el "shell" propio (HTML, manifiesto e
 * iconos). Los datos viven en Firebase y en localStorage, no acá.
 *
 * Estrategia:
 *  - Navegaciones y HTML: red primero, con la copia cacheada como respaldo.
 *    Así el personal recibe las actualizaciones apenas se publican.
 *  - Iconos y manifiesto: cache primero, refrescando en segundo plano.
 *  - Todo lo demás (Firebase, la app de incidencias embebida, gstatic):
 *    pasa directo a la red, sin intervención del worker.
 */
const VERSION = 'hru-quirofanos-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // addAll falla entero si un recurso falla; se agregan de a uno.
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Solo se gestiona el propio origen y dentro del alcance de la app.
  if (url.origin !== self.location.origin) return;

  const scope = new URL('./', self.location.href).pathname;
  if (!url.pathname.startsWith(scope)) return;

  const esHTML = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');

  if (esHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copia)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const red = fetch(req).then((res) => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copia)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || red;
    })
  );
});

/* Notificaciones: si el navegador entrega el aviso al worker, al tocarlo se
   enfoca la pestaña de la app en lugar de abrir una nueva. */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const c of lista) {
        if (c.url.includes(self.registration.scope) && 'focus' in c) return c.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow('./') : null;
    })
  );
});
