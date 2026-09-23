const VERSION = "shm-admin-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("shm-admin-") && key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Les écrans et données Admin restent exclusivement servis par le réseau.
// Aucun contenu authentifié n'est conservé dans le cache du navigateur.
self.addEventListener("fetch", () => {});
