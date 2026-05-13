const cron = require("node-cron");
const pool = require("../config/db");
const webpush = require("web-push");
const admin = require("firebase-admin");

// 1. Inicializar Firebase Admin (Asegúrate de que la ruta al archivo json sea correcta)
const serviceAccount = require("../firebase-key.json");
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// 2. Configuración de Web Push
webpush.setVapidDetails(
  "mailto:rodriguezyerson2005@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const startReminderCron = () => {
  cron.schedule(
    "00 08 * * *",
    async () => {
      console.log("[CRON] Iniciando escaneo diario de recordatorios...");

      try {
        const query = `
          SELECT 
            e.title as evaluation_title, 
            s.name as subject_name,
            ps.subscription,
            ps.id as subscription_id
          FROM evaluations e
          JOIN subjects s ON e.subject_id = s.id
          JOIN terms t ON s.term_id = t.id
          JOIN push_subscriptions ps ON t.user_id = ps.user_id
          WHERE e.due_date = CURRENT_DATE + INTERVAL '1 day'
        `;

        const { rows } = await pool.query(query);
        console.log(`[CRON] Se encontraron ${rows.length} recordatorios.`);

        const notificationPromises = rows.map(async (item) => {
          const titleStr = "⏳ Entrega Mañana";
          const bodyStr = `Recuerda: "${item.evaluation_title}" de ${item.subject_name}.`;
          
          // Verificamos de qué tipo es la suscripción
          const isFCM = item.subscription.type === 'fcm-android';

          try {
            if (isFCM) {
              // --- LÓGICA PARA EL APK (FIREBASE) ---
              const message = {
                notification: { title: titleStr, body: bodyStr },
                token: item.subscription.endpoint // En FCM, el endpoint es el token String
              };
              await admin.messaging().send(message);
              
            } else {
              // --- LÓGICA PARA LA WEB (VAPID) ---
              const payload = JSON.stringify({ title: titleStr, body: bodyStr, url: "/calendar" });
              await webpush.sendNotification(item.subscription.endpoint, payload);
            }
          } catch (error) {
            // Manejo de errores para limpiar tokens viejos/borrados
            const isWebExpired = !isFCM && (error.statusCode === 410 || error.statusCode === 404);
            const isFCMExpired = isFCM && (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-argument');

            if (isWebExpired || isFCMExpired) {
              console.log(`[CRON] Suscripción expirada. Eliminando ID: ${item.subscription_id}`);
              await pool.query("DELETE FROM push_subscriptions WHERE id = $1", [item.subscription_id]);
            } else {
              console.error(`[CRON] Error enviando push (${isFCM ? 'FCM' : 'WEB'}):`, error);
            }
          }
        });

        await Promise.all(notificationPromises);
        console.log("[CRON] Proceso de recordatorios finalizado.");
      } catch (error) {
        console.error("[CRON] Error fatal en la tarea programada:", error);
      }
    },
    { scheduled: true, timezone: "America/Bogota" }
  );
};

module.exports = { startReminderCron };