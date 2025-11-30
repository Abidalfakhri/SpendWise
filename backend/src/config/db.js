// db.js (backend/src/config/db.js)

require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
    family: 4, 
}

// Pengecekan Kritis Variabel Lingkungan
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.error(`🚨 FATAL: Database variable '${key}' missing.`);
        throw new Error(`Missing DB variable: ${key}`);
    }
});

const pool = new Pool(dbConfig);

// Error Handling Pool
pool.on('error', (err, client) => {
    console.error('❌ Unexpected DB Pool error:', err);
});

// Uji koneksi awal untuk memvalidasi kredensial saat startup
pool.connect()
    .then(client => {
        console.log("✅ Database connected successfully.");
        client.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed at startup:", err.message);
        throw err; 
    });

module.exports = pool;