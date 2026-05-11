import api from './api';

const VAPID_PUBLIC_KEY = "BGZ7HPj-77A-M0KNE4hKBhAiEmNbTcFFdk8qDcRHIuYSV6oLli6CLOY3Io9vr4-WK7vbIKraClaXp9TBhmY-OiE"; // Pégala aquí

// Función para decodificar la llave pública (requerimiento de la API del navegador)
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const enablePushNotifications = async (vapidPublicKey: string) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // 1. Pedir permiso al usuario (Muestra la alerta "CampusSync quiere enviarte notificaciones")
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Permiso denegado');

    // 2. Obtener el Service Worker activo
    const registration = await navigator.serviceWorker.ready;

    // 3. Suscribirse usando la llave pública de tu backend
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    // 4. Enviar el resultado al backend para guardarlo en PostgreSQL
    await api.post('/push/subscribe', subscription);
    
    return true;
  } catch (error) {
    console.error('Error al habilitar push:', error);
    return false;
  }
};

export const pushService = {
  subscribeUser: async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Tu navegador no soporta notificaciones push');
    }

    try {
      // 1. Pedir permiso al usuario ANTES de registrar el Service Worker
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado por el usuario');
      }

      // 2. FORZAR el registro explícito del Service Worker
      const registration = await navigator.serviceWorker.register('/custom-sw.js');
      
      // Asegurarnos de que está instalado y activo
      await navigator.serviceWorker.ready;

      // 3. Revisar si ya existe una suscripción activa en el navegador
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Generar una nueva suscripción atada a tu llave VAPID
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      // 4. Enviar a PostgreSQL a través de tu Backend
      await api.post('/push/subscribe', subscription);
      return true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error detallado en PushService:', error);
      // Lanzamos el error para que el componente (NotificationBanner) muestre el toast rojo
      throw error; 
    }
  }
};