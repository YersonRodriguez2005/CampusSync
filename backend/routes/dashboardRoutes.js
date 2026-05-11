const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const verifyToken = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a TODAS las rutas del dashboard
router.use(verifyToken);

// Ruta base será /api/dashboard, por lo que aquí solo va /summary
router.get('/summary', getDashboardSummary);

module.exports = router;