self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body,
      icon: '/NTapp.png',
      data: data.url || '/' // 👈 optional fallback click-through
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.notification.data) {
    e.waitUntil(clients.openWindow(e.notification.data));
  }
});
