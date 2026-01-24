// Service Worker de fallback mínimo - solo para funcionamiento básico offline
// Este archivo se usa si el SW principal falla

self.addEventListener('install', (event) => {
  // Instalar inmediatamente sin esperar
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Activar inmediatamente
  event.waitUntil(self.clients.claim());
});

// Estrategia simple: siempre usar red primero, luego caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Si falla la red, intentar caché
        return caches.match(event.request);
      })
  );
});
