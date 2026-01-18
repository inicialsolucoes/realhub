self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    
    if (event.data) {
        try {
            const data = event.data.json();
            console.log('[Service Worker] Push Data:', data);

            const title = data.notification.title || 'Nova Notificação';
            const options = {
                body: data.notification.body,
                icon: data.notification.icon || '/icon-192x192.png',
                badge: data.notification.badge || '/badge-72x72.png',
                data: data.notification.data
            };

            event.waitUntil(
                self.registration.showNotification(title, options)
            );
        } catch (e) {
            console.error('[Service Worker] Error parsing push data:', e);
        }
    } else {
        console.log('[Service Worker] Push event but no data.');
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
