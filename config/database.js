// config/database.js
require('dotenv').config();
const mysql = require('mysql2/promise');

// Buat connection pool untuk performa lebih baik
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi saat startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        connection.release();
    } catch (err) {
        console.error('❌ Error connecting to database:', err.message);
    }
})();

module.exports = pool;