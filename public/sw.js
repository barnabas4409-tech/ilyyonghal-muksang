// Service Worker — 일용할묵상 Push Handler

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? '일용할묵상';
  const options = {
    body: data.body ?? '오늘 묵상 하셨나요?',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag ?? 'devotion-reminder',
    renotify: true,
    data: { url: data.url ?? '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
