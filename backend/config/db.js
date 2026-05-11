const { Pool } = require('pg');

// 1. Declaramos la variable ANTES de usarla
const isProduction = process.env.NODE_ENV === 'production';

// 2. Configuramos el Pool usando la variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// 3. Verificamos la conexión
pool.on('connect', () => {
  console.log('🔗 Conectado a la base de datos PostgreSQL');
});

module.exports = pool;