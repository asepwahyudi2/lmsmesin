const CACHE_NAME = "lms-mesin-cache-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/favicon.ico",
];

// Install Service Worker & Cache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate & Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Intercept & Offline Fallback
self.addEventListener("fetch", (event) => {
  // Hanya intercept request navigasi dokumen HTML & GET request
  if (event.request.mode === "navigate" && event.request.method === "GET") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || Response.error();
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      }).catch(() => {
        // Safe fallback
        if (event.request.destination === "image") {
          return new Response("", { headers: { "Content-Type": "image/png" } });
        }
      })
    );
  }
});

// Listen Push Notification
self.addEventListener("push", (event) => {
  let data = { title: "LMS SMK YPWKS", body: "Ada pengumuman atau tugas baru di bengkel!" };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_e) {
      data = { title: "LMS SMK YPWKS", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/favicon.ico",
    data: data,
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Buka LMS" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listen Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
