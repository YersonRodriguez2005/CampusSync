const pool = require('../config/db');

// Crear materia
const createSubject = async (req, res) => {
  try {
    const { term_id, name, target_score } = req.body;
    const userId = req.user.userId;

    if (!term_id || !name || !target_score) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (term_id, name, target_score)' });
    }

    // 1. VALIDACIÓN DE PERTENENCIA: Verificar que el term_id pertenezca al usuario del token
    const termOwnership = await pool.query(
      'SELECT id FROM terms WHERE id = $1 AND user_id = $2',
      [term_id, userId]
    );

    if (termOwnership.rows.length === 0) {
      return res.status(403).json({ 
        error: 'No tienes permiso para agregar materias a este semestre o el semestre no existe' 
      });
    }

    // 2. INSERCIÓN: Si la validación pasa, creamos la materia
    const newSubject = await pool.query(
      'INSERT INTO subjects (term_id, name, target_score) VALUES ($1, $2, $3) RETURNING *',
      [term_id, name, target_score]
    );

    res.status(201).json(newSubject.rows[0]);
  } catch (error) {
    console.error('Error en createSubject:', error);
    res.status(500).json({ error: 'Error interno al crear la materia' });
  }
};

// Obtener materias
const getSubjectsByTerm = async (req, res) => {
  try {
    const { termId } = req.params;
    const userId = req.user.userId;

    // Obtenemos las materias filtrando por el semestre y asegurando que el semestre sea del usuario
    const subjects = await pool.query(
      `SELECT s.* FROM subjects s 
       JOIN terms t ON s.term_id = t.id 
       WHERE s.term_id = $1 AND t.user_id = $2`,
      [termId, userId]
    );

    res.status(200).json(subjects.rows);
  } catch (error) {
    console.error('Error en getSubjectsByTerm:', error);
    res.status(500).json({ error: 'Error al obtener las materias' });
  }
};

// Actualizar materia
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_score } = req.body;
    const userId = req.user.userId;

    const updatedSubject = await pool.query(
      `UPDATE subjects s
       SET name = COALESCE($1, s.name), 
           target_score = COALESCE($2, s.target_score)
       FROM terms t
       WHERE s.id = $3 AND s.term_id = t.id AND t.user_id = $4
       RETURNING s.*`,
      [name, target_score, id, userId]
    );

    if (updatedSubject.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada o no autorizada' });
    }

    res.status(200).json(updatedSubject.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la materia' });
  }
};

// Eliminar Materia
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await pool.query(
      `DELETE FROM subjects s
       USING terms t
       WHERE s.id = $1 AND s.term_id = t.id AND t.user_id = $2
       RETURNING s.id`,
      [id, userId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada o no autorizada' });
    }

    res.status(200).json({ message: 'Materia y sus notas eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la materia' });
  }
};

module.exports = { createSubject, getSubjectsByTerm, updateSubject, deleteSubject };