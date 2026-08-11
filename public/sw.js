self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function getPushData(eventData) {
  try {
    const data = eventData.json();
    return data && typeof data === "object" ? data : {};
  } catch {
    return { body: eventData.text() };
  }
}

async function updateAppBadge(badgeCount) {
  if (!Number.isInteger(badgeCount) || badgeCount < 0) return;

  try {
    if (badgeCount > 0 && typeof self.navigator?.setAppBadge === "function") {
      await self.navigator.setAppBadge(badgeCount);
    } else if (
      badgeCount === 0 &&
      typeof self.navigator?.clearAppBadge === "function"
    ) {
      await self.navigator.clearAppBadge();
    }
  } catch {
    // El aviso Push continúa aunque el sistema no permita actualizar el badge.
  }
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = getPushData(event.data);
  const notificationId = data.notificationId || undefined;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || "Cuida", {
        body: data.body,
        icon: data.icon || "/web-app-manifest-192x192.png",
        badge: data.badge || "/cuida-badge-96.png",
        lang: data.lang || "es-AR",
        tag: notificationId,
        renotify: Boolean(notificationId),
        silent: false,
        vibrate: [200, 100, 200],
        timestamp: Number.isFinite(data.timestamp) ? data.timestamp : Date.now(),
        data: { url: data.url || "/app" },
      }),
      updateAppBadge(data.badgeCount),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/app", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const existingClient = windowClients.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      if (existingClient) {
        return existingClient.navigate(targetUrl).then((client) => client?.focus());
      }
      return clients.openWindow(targetUrl);
    }),
  );
});
