require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('Connection successful!');
    await connection.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

test();
