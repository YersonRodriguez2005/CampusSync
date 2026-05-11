const cron = require("node-cron");
const pool = require("../config/db");
const webpush = require("web-push");

// 1. Configuración de Web Push
webpush.setVapidDetails(
  "mailto:rodriguezyerson2005@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// 2. Programar la tarea para las 8:00 AM (00 08 * * *) hora de Colombia
const startReminderCron = () => {
  cron.schedule(
    "00 08 * * *",
    async () => {
      console.log("[CRON] Iniciando escaneo diario de recordatorios...");

      try {
        // Consulta SQL: Buscamos evaluaciones que venzan MAÑANA y tengan suscripciones push
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

        console.log(
          `[CRON] Se encontraron ${rows.length} recordatorios para enviar.`,
        );

        // Enviamos las notificaciones en paralelo para mayor eficiencia
        const notificationPromises = rows.map(async (item) => {
          const payload = JSON.stringify({
            title: "⏳ Entrega Mañana",
            body: `Recuerda: "${item.evaluation_title}" de ${item.subject_name}.`,
            url: "/calendar",
          });

          try {
            await webpush.sendNotification(item.subscription, payload);
          } catch (error) {
            // Si el código es 410 o 404, el token expiró y debemos borrarlo
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(
                `[CRON] Suscripción expirada detected. Eliminando ID: ${item.subscription_id}`,
              );
              await pool.query("DELETE FROM push_subscriptions WHERE id = $1", [
                item.subscription_id,
              ]);
            } else {
              console.error("[CRON] Error enviando push:", error);
            }
          }
        });

        await Promise.all(notificationPromises);
        console.log("[CRON] Proceso de recordatorios finalizado.");
      } catch (error) {
        console.error("[CRON] Error fatal en la tarea programada:", error);
      }
    },
    {
      scheduled: true,
      timezone: "America/Bogota"
    }
  );
};

module.exports = { startReminderCron };