/* Show the notification */
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'New message', {
      body: data.body,
      icon: '/NTapp.png',
      data: data.url || '/'
    })
  );
});

/* Click-through */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.notification.data) e.waitUntil(clients.openWindow(e.notification.data));
});
