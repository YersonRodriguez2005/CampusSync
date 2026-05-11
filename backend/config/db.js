const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('error', (err, client) => {
  console.error('Error inesperado en el pool de base de datos', err);
  process.exit(-1);
});

module.exports = pool;