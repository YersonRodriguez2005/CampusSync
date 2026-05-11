const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // El estándar es enviar el token en los headers como: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Token no proveído o formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica si el token fue firmado por tu servidor y si no ha expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inyectamos el ID del usuario en el objeto "req" para que el siguiente controlador sepa quién hace la petición
    req.user = decoded; 
    next(); // Pasa el control a la siguiente función
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;