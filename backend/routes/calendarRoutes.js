const express = require('express');
const router = express.Router();
const { getCalendarEvents } = require('../controllers/calendarController');
const verifyToken = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/events', getCalendarEvents);

module.exports = router;