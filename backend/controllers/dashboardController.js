const pool = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Contar materias activas (solo de semestres marcados como is_active = true)
    const activeSubjectsResult = await pool.query(
      `SELECT count(s.id) AS total 
       FROM subjects s
       JOIN terms t ON s.term_id = t.id
       WHERE t.user_id = $1 AND t.is_active = true`,
      [userId]
    );
    const activeSubjects = parseInt(activeSubjectsResult.rows[0].total, 10);

    // 2. Obtener el promedio histórico agrupado por semestres (para la gráfica)
    // Calcula la nota de cada materia, y luego promedia las materias de cada semestre
    const chartDataResult = await pool.query(
      `SELECT 
         t.name,
         COALESCE(AVG(
           (SELECT COALESCE(SUM(score * (weight_percentage / 100.0)), 0) 
            FROM evaluations WHERE subject_id = s.id)
         ), 0) AS promedio
       FROM terms t
       LEFT JOIN subjects s ON s.term_id = t.id
       WHERE t.user_id = $1
       GROUP BY t.id, t.name
       ORDER BY t.created_at ASC`,
      [userId]
    );

    const chartData = chartDataResult.rows;

    // 3. Calcular el promedio global acumulado (promedio de todos los semestres)
    let globalAverage = 0;
    if (chartData.length > 0) {
      const sum = chartData.reduce((acc, curr) => acc + parseFloat(curr.promedio), 0);
      globalAverage = sum / chartData.length;
    }

    // 4. Enviar la respuesta con la estructura exacta que espera la interfaz de React
    res.status(200).json({
      active_subjects: activeSubjects,
      global_average: globalAverage,
      chart_data: chartData.map(r => ({
        name: r.name,
        promedio: parseFloat(r.promedio) // Aseguramos que sea un número (float) para Recharts
      }))
    });

  } catch (error) {
    console.error('Error en getDashboardSummary:', error);
    res.status(500).json({ error: 'Error al generar métricas del dashboard' });
  }
};

module.exports = { getDashboardSummary };