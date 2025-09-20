// Service Worker para KantoBar Karaoke PWA
const CACHE_NAME = "kantobar-karaoke-v1";
const urlsToCache = ["/karaoke", "/kantobar-icon.svg", "/manifest.json"];

// Instalar service worker
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Cache abierto");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activar service worker
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activado");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Eliminando cache viejo:", cacheName);
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

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en cache, devolverlo
      if (response) {
        console.log("📦 Sirviendo desde cache:", event.request.url);
        return response;
      }

      // Si no está en cache, hacer fetch y cachear
      console.log("🌐 Fetching desde red:", event.request.url);
      return fetch(event.request).then((response) => {
        // Verificar que la respuesta sea válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

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
