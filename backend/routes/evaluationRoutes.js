const express = require('express');
const router = express.Router();
const { 
  calculateSubjectMetrics, 
  getEvaluationsBySubject, 
  createEvaluation, 
  updateEvaluation, 
  deleteEvaluation 
} = require('../controllers/evaluationController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/metrics/:subjectId', calculateSubjectMetrics);
router.get('/subject/:subjectId', getEvaluationsBySubject);
router.post('/', createEvaluation);
router.put('/:id', updateEvaluation);
router.delete('/:id', deleteEvaluation);

module.exports = router;