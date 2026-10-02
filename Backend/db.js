// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Hosted MySQL (e.g. Aiven) requires TLS; pass its CA certificate via DB_CA_CERT
  ssl: process.env.DB_CA_CERT ? { ca: process.env.DB_CA_CERT.replace(/\n/g, '\n') } : undefined,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = pool;
