require('dotenv').config();
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const schema = require('./schema');

// Create pool lazily — don't throw at startup if DB is unreachable
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
  ssl: { rejectUnauthorized: false },
});

// Log connection errors without crashing
pool.on('error', (err) => {
  console.warn('[DB Pool Error]', err.message);
});

const db = drizzle(pool, { schema, mode: 'default' });

module.exports = { db };
