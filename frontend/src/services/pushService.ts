import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import api from './api';

// 1. Obtenemos la llave pública desde las variables de entorno de Vite
// Asegúrate de que en tu archivo .env del frontend exista VITE_VAPID_PUBLIC_KEY
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// 2. Función Helper: Convierte la llave Base64 a un arreglo de bytes (Requerido por la API Web Push)
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const pushService = {
  subscribeUser: async () => {
    // ─── 1. ENTORNO NATIVO (APK Android) ───
    if (Capacitor.isNativePlatform()) {
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        throw new Error('Permiso denegado en Android');
      }

      await PushNotifications.register();

      return new Promise((resolve, reject) => {
        PushNotifications.addListener('registration', async (token) => {
          try {
            await api.post('/push/subscribe', {
              endpoint: token.value,
              type: 'fcm-android' 
            });
            resolve(true);
          } catch (err) {
            reject(err);
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          reject(error);
        });
      });
    } 
    
    // ─── 2. ENTORNO WEB / PWA ───
    else {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Tu navegador no soporta notificaciones push');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permiso denegado');

      const registration = await navigator.serviceWorker.register('/custom-sw.js');
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        // Validación de seguridad para que no intente suscribir si falta la llave en el .env
        if (!VAPID_PUBLIC_KEY) {
            throw new Error('No se encontró VITE_VAPID_PUBLIC_KEY en el entorno.');
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      await api.post('/push/subscribe', {
         endpoint: subscription,
         type: 'web-push'
      });
      return true;
    }
  },

  sendTest: async () => {
    await api.post('/push/send-test');
  }
};