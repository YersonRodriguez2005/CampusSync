const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu correo (ej: soporte@campussync.com)
    pass: process.env.EMAIL_PASS  // "App Password" generado en Google Account
  }
});


const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validación básica
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const userCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash],
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error en registerUser:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login exitoso",
      token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en loginUser:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    // Por seguridad, siempre devolvemos 200 aunque el correo no exista
    if (userResult.rows.length === 0) {
      return res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace.' });
    }

    // Generar un token criptográfico de 32 bytes en formato hexadecimal
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Configurar expiración (ej: 1 hora desde ahora)
    const expireDate = new Date(Date.now() + 3600000); 

    // Guardar el token y la expiración en la base de datos
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
      [resetToken, expireDate, email]
    );

    // Construir el enlace hacia el Frontend de React (Ajusta el puerto si es necesario)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Enviar el correo electrónico
    await transporter.sendMail({
      from: '"CampusSync Support" <soporte@campussync.com>',
      to: email,
      subject: 'Recuperación de Contraseña - CampusSync',
      html: `
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta académica.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva (este enlace expira en 1 hora):</p>
        <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background-color:#4F46E5; color:white; text-decoration:none; border-radius:8px;">Restablecer Contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `
    });

    res.status(200).json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ error: 'Error procesando la solicitud de recuperación' });
  }
};

// 2. Ejecutar el cambio (Se llama desde la nueva vista de React)
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Buscar al usuario por el token, asegurando que la fecha actual sea menor a la de expiración
    const userResult = await pool.query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'El token es inválido o ha expirado.' });
    }

    const userId = userResult.rows[0].id;

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña y limpiar los campos del token (anularlo)
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
