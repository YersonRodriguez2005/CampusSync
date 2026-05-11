const pool = require('../config/db');

const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Consultamos todas las evaluaciones/tareas vinculadas al usuario
    const query = `
      SELECT 
        e.id, 
        e.title, 
        e.due_date, 
        e.weight_percentage, 
        e.score,
        s.name AS subject_name,
        t.name AS term_name
      FROM evaluations e
      JOIN subjects s ON e.subject_id = s.id
      JOIN terms t ON s.term_id = t.id
      WHERE t.user_id = $1
      ORDER BY e.due_date ASC
    `;

    const result = await pool.query(query, [userId]);
    
    // Formateamos para que el frontend reciba objetos listos para procesar
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error en getCalendarEvents:', error);
    res.status(500).json({ error: 'Error al cargar los eventos del calendario' });
  }
};

module.exports = { getCalendarEvents };