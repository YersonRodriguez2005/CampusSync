// Este script se ejecuta en segundo plano en el sistema operativo
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    // Configuramos cómo se verá la alerta en la pantalla de bloqueo
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png', // Icono monocromático para la barra de estado superior
      vibrate: [200, 100, 200, 100, 200], // Patrón de vibración nativo
      data: { url: data.url } // Datos invisibles para saber a dónde ir al hacer clic
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Qué hacer cuando el estudiante toca la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});