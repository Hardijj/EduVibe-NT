self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || "No body",
    icon: '/NTapp.png',
    data: data.url || '/'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
