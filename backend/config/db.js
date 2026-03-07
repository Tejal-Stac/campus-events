const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'campus_events',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('Please check your .env file and ensure PostgreSQL is running');
  } else {
    console.log('✅ Successfully connected to Local PostgreSQL Database.');
    console.log(`Database: ${process.env.DB_NAME || 'campus_events'}`);
    console.log(`Timestamp: ${res.rows[0].now}`);
  }
});

module.exports = pool;