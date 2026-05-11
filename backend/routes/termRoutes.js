const express = require('express');
const router = express.Router();
const { createTerm, getTerms, deleteTerm } = require('../controllers/termController');
const verifyToken = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a TODAS las rutas de este router
router.use(verifyToken);

// Rutas: /api/v1/terms
router.post('/', createTerm);
router.get('/', getTerms);
router.delete('/:id', deleteTerm);

module.exports = router;