const webpush = require('web-push');
const pool = require('../config/db');

// Configuración de credenciales
webpush.setVapidDetails(
  'mailto:rodriguezyerson2005@gmail.com', // Tu correo
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscribe = async (req, res) => {
  try {
    const subscription = req.body; // El objeto de suscripción generado por el navegador
    const userId = req.user.userId;

    // Guardamos el objeto JSON exacto en PostgreSQL
    await pool.query(
      'INSERT INTO push_subscriptions (user_id, subscription) VALUES ($1, $2)',
      [userId, subscription]
    );

    res.status(201).json({ message: 'Dispositivo suscrito con éxito' });
  } catch (error) {
    console.error('Error en suscripción push:', error);
    res.status(500).json({ error: 'Error al procesar la suscripción' });
  }
};

module.exports = { subscribe };