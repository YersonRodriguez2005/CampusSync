const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword} = require('../controllers/userController');

// Ruta: POST /api/users/register
router.post('/register', registerUser);

// Ruta: POST /api/users/login
router.post('/login', loginUser);

// Ruta: POST /api/users/forgot-password
router.post('/forgot-password', forgotPassword);

// Ruta: POST /api/users/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;