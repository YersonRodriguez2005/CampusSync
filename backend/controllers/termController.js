const pool = require('../config/db');

// Crear un nuevo semestre
const createTerm = async (req, res) => {
  try {
    const { name, is_active = true } = req.body;
    const userId = req.user.userId; 

    if (!name) {
      return res.status(400).json({ error: 'El nombre del semestre es obligatorio' });
    }

    // Opcional pero recomendado: Si este semestre es activo, desactivar los anteriores del usuario
    if (is_active) {
      await pool.query('UPDATE terms SET is_active = false WHERE user_id = $1', [userId]);
    }

    const newTerm = await pool.query(
      'INSERT INTO terms (user_id, name, is_active) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, is_active]
    );

    res.status(201).json(newTerm.rows[0]);
  } catch (error) {
    console.error('Error en createTerm:', error);
    res.status(500).json({ error: 'Error al crear el semestre' });
  }
};

// Obtener todos los semestres del usuario
const getTerms = async (req, res) => {
  try {
    const userId = req.user.userId;
    const terms = await pool.query(
      'SELECT * FROM terms WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(terms.rows);
  } catch (error) {
    console.error('Error en getTerms:', error);
    res.status(500).json({ error: 'Error al obtener los semestres' });
  }
};

// Eliminar un semestre (Eliminará materias y notas en cascada gracias a la DB)
const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deletedTerm = await pool.query(
      'DELETE FROM terms WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (deletedTerm.rows.length === 0) {
      return res.status(404).json({ error: 'Semestre no encontrado o no autorizado' });
    }

    res.status(200).json({ message: 'Semestre eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteTerm:', error);
    res.status(500).json({ error: 'Error al eliminar el semestre' });
  }
};

module.exports = { createTerm, getTerms, deleteTerm };