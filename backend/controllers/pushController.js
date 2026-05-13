const webpush = require('web-push');
const pool = require('../config/db');
const admin = require('firebase-admin');

// 1. Inicializar Firebase Admin de forma segura (previene error de app duplicada)
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// 2. Configuración Web Push (VAPID)
webpush.setVapidDetails(
  'mailto:rodriguezyerson2005@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── ENDPOINT 1: GUARDAR SUSCRIPCIÓN ───
const subscribe = async (req, res) => {
  try {
    const subscription = req.body; 
    const userId = req.user.userId;

    await pool.query(
      'INSERT INTO push_subscriptions (user_id, subscription) VALUES ($1, $2)',
      [userId, subscription]
    );

    res.status(201).json({ message: 'Dispositivo suscrito con éxito' });
  } catch (error) {
    console.error('[SUBSCRIBE ERROR] Error al guardar en base de datos:', error);
    res.status(500).json({ error: 'Error al procesar la suscripción' });
  }
};

// ─── ENDPOINT 2: ENVIAR PRUEBA ───
const sendTestNotification = async (req, res) => {
  let activeSubId = null;
  let isFCM = false;

  try {
    const userId = req.user.userId;

    // Buscar la suscripción más reciente de este usuario
    const { rows } = await pool.query(
      'SELECT id, subscription FROM push_subscriptions WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No tienes notificaciones activadas en la base de datos.' });
    }

    const subData = rows[0];
    activeSubId = subData.id; // Guardamos el ID por si toca borrarlo por error
    isFCM = subData.subscription.type === 'fcm-android';

    if (isFCM) {
      // PRUEBA A CELULAR (FIREBASE)
      const message = {
        notification: { title: '¡Prueba Exitosa! 🚀', body: 'Firebase (FCM) está funcionando en tu APK de CampusSync.' },
        token: subData.subscription.endpoint
      };
      await admin.messaging().send(message);
    } else {
      // PRUEBA A NAVEGADOR (WEB PUSH)
      const payload = JSON.stringify({
        title: '¡Prueba Exitosa! 🚀',
        body: 'La API Web Push está funcionando en tu navegador.',
        url: '/calendar'
      });
      await webpush.sendNotification(subData.subscription.endpoint, payload);
    }

    res.status(200).json({ message: 'Notificación de prueba enviada con éxito.' });

  } catch (error) {
    console.error(`[PUSH TEST ERROR - ${isFCM ? 'FCM' : 'WEB'}] Detalle técnico:`, error);
    
    // Evaluamos si el error ocurrió porque el token expiró o la app fue desinstalada
    const isWebExpired = !isFCM && (error.statusCode === 410 || error.statusCode === 404);
    const isFCMExpired = isFCM && (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument');

    if (isWebExpired || isFCMExpired) {
       console.log(`[CLEANUP] Borrando suscripción expirada ID: ${activeSubId}`);
       await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [activeSubId]);
       return res.status(410).json({ error: 'Tu token había expirado. Refresca la app y vuelve a darle en "Activar".' });
    }

    res.status(500).json({ error: 'Falló el envío en el servidor', details: error.message });
  }
};

module.exports = { subscribe, sendTestNotification };