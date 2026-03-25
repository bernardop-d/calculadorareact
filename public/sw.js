self.addEventListener("push", (event) => {
  let data = { title: "Nova publicação!", body: "Confira o novo conteúdo." };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    // ignore parse errors
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Nova publicação!", {
      body: data.body ?? "",
      icon: "/creator.jpg",
      badge: "/creator.jpg",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
