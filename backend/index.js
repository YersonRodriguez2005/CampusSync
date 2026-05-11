const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const termRoutes = require('./routes/termRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const pushRoutes = require('./routes/pushRoutes');
const { startReminderCron } = require('./utils/cronJobs');

const app = express();

startReminderCron();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/terms', termRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/push', pushRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});