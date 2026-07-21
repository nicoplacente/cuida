self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Cuida", {
      body: data.body,
      icon: data.icon || "/cuida-icon-192.png",
      badge: data.badge || "/cuida-badge-96.png",
      tag: data.notificationId || undefined,
      renotify: true,
      silent: false,
      data: { url: data.url || "/app" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/app", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const existingClient = windowClients.find((client) => client.url === targetUrl);
      if (existingClient) return existingClient.focus();
      return clients.openWindow(targetUrl);
    }),
  );
});
