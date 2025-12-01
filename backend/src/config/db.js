const { Pool } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
