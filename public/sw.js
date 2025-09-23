// Service Worker para KantoBar Karaoke PWA
const CACHE_NAME = "kantobar-karaoke-v1";
const urlsToCache = ["/karaoke/", "/kantobar-icon.svg", "/manifest.json"];

// Instalar service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  // Solo interceptar requests GET
  if (event.request.method !== "GET") {
    return;
  }

  // Verificar que el request sea válido para cachear
  const url = new URL(event.request.url);
  if (
    url.protocol === "chrome-extension:" ||
    url.protocol === "chrome:" ||
    url.protocol === "moz-extension:" ||
    url.protocol === "ms-browser-extension:" ||
    (url.hostname === "localhost" && url.port === "5173") // No cachear Vite dev server
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en cache, devolverlo
      if (response) {
        return response;
      }

      // Si no está en cache, hacer fetch y cachear
      return fetch(event.request).then((response) => {
        // Verificar que la respuesta sea válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // La validación de URL ya se hizo al inicio del evento

        // Clonar la respuesta
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
