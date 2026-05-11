const pool = require('../config/db');

// Calcula métricas de materias
const calculateSubjectMetrics = async (subjectId) => {
  const query = `
    SELECT 
      COALESCE(SUM(weight_percentage), 0) AS total_weight_assigned,
      COALESCE(SUM(CASE WHEN score IS NOT NULL THEN weight_percentage ELSE 0 END), 0) AS evaluated_weight,
      COALESCE(SUM(score * (weight_percentage / 100)), 0) AS current_accumulated_score
    FROM evaluations 
    WHERE subject_id = $1
  `;
  const result = await pool.query(query, [subjectId]);
  return {
    total_weight_assigned: parseFloat(result.rows[0].total_weight_assigned),
    evaluated_weight: parseFloat(result.rows[0].evaluated_weight),
    current_accumulated_score: parseFloat(result.rows[0].current_accumulated_score).toFixed(2)
  };
};

// Obtener todas las evaluaciones de una materia específica
const getEvaluationsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.userId;

    // Join para asegurar que el usuario que consulta es dueño del semestre/materia
    const result = await pool.query(
      `SELECT e.* FROM evaluations e
       JOIN subjects s ON e.subject_id = s.id
       JOIN terms t ON s.term_id = t.id
       WHERE e.subject_id = $1 AND t.user_id = $2
       ORDER BY e.created_at ASC`,
      [subjectId, userId]
    );

    // Devolvemos el array (incluso si está vacío, el frontend mostrará "Sin actividades registradas")
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error en getEvaluationsBySubject:', error);
    res.status(500).json({ error: 'Error al obtener las evaluaciones' });
  }
};

// Crear evaluación
const createEvaluation = async (req, res) => {
  try {
    const { subject_id, title, weight_percentage, score, due_date } = req.body;
    const userId = req.user.userId;

    // 1. Validar propiedad (Security Chain: Subject -> Term -> User)
    const ownershipCheck = await pool.query(
      `SELECT s.id FROM subjects s 
       JOIN terms t ON s.term_id = t.id 
       WHERE s.id = $1 AND t.user_id = $2`,
      [subject_id, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Materia no encontrada o no autorizada' });
    }

    // 2. Validar que no se exceda el 100% del peso en la materia
    const currentMetrics = await calculateSubjectMetrics(subject_id);
    if ((currentMetrics.total_weight_assigned + parseFloat(weight_percentage)) > 100) {
      return res.status(400).json({ 
        error: `Límite excedido. Queda un ${(100 - currentMetrics.total_weight_assigned).toFixed(2)}% disponible para esta materia.` 
      });
    }

    // 3. Insertar la evaluación
    const newEval = await pool.query(
      `INSERT INTO evaluations (subject_id, title, weight_percentage, score, due_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [subject_id, title, weight_percentage, score, due_date || null]
    );

    // 4. Recalcular el promedio para devolverlo actualizado al frontend
    const updatedMetrics = await calculateSubjectMetrics(subject_id);

    res.status(201).json({
      evaluation: newEval.rows[0],
      subject_metrics: updatedMetrics
    });

  } catch (error) {
    console.error('Error en createEvaluation:', error);
    res.status(500).json({ error: 'Error al crear la evaluación' });
  }
};

// Actualizar evaluación
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, weight_percentage, score, due_date } = req.body;
    const userId = req.user.userId;

    // Actualizar con validación de propiedad embebida en la subconsulta
    const updatedEval = await pool.query(
      `UPDATE evaluations e
       SET 
         title = COALESCE($1, title),
         weight_percentage = COALESCE($2, weight_percentage),
         score = COALESCE($3, score),
         due_date = COALESCE($4, due_date)
       FROM subjects s
       JOIN terms t ON s.term_id = t.id
       WHERE e.id = $5 AND e.subject_id = s.id AND t.user_id = $6
       RETURNING e.*`,
      [title, weight_percentage, score, due_date, id, userId]
    );

    if (updatedEval.rows.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada o no autorizada' });
    }

    // Devolver la nota modificada y el nuevo promedio recalculado
    const updatedMetrics = await calculateSubjectMetrics(updatedEval.rows[0].subject_id);

    res.status(200).json({
      evaluation: updatedEval.rows[0],
      subject_metrics: updatedMetrics
    });

  } catch (error) {
    console.error('Error en updateEvaluation:', error);
    res.status(500).json({ error: 'Error al actualizar la evaluación' });
  }
};

// Eliminar evaluación
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Primero obtenemos el subject_id antes de borrar para poder recalcular
    const evalData = await pool.query(
      `SELECT e.subject_id FROM evaluations e
       JOIN subjects s ON e.subject_id = s.id
       JOIN terms t ON s.term_id = t.id
       WHERE e.id = $1 AND t.user_id = $2`,
      [id, userId]
    );

    if (evalData.rows.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    const subjectId = evalData.rows[0].subject_id;

    // Ejecutar eliminación
    await pool.query('DELETE FROM evaluations WHERE id = $1', [id]);

    // Recalcular métricas tras la eliminación
    const updatedMetrics = await calculateSubjectMetrics(subjectId);

    res.status(200).json({ 
      message: 'Nota eliminada',
      subject_metrics: updatedMetrics 
    });
  } catch (error) {
    console.error('Error en deleteEvaluation:', error);
    res.status(500).json({ error: 'Error al eliminar la evaluación' });
  }
};

// Asegúrate de exportar el nuevo método
module.exports = { 
  calculateSubjectMetrics, 
  getEvaluationsBySubject, 
  createEvaluation, 
  updateEvaluation, 
  deleteEvaluation 
};