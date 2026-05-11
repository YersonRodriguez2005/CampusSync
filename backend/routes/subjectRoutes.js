const express = require('express');
const router = express.Router();
const { createSubject, getSubjectsByTerm, updateSubject, deleteSubject} = require('../controllers/subjectController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', createSubject);
router.get('/term/:termId', getSubjectsByTerm);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;