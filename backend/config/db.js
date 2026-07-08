const { Pool } = require('pg');
require('dotenv').config();

// Check if DATABASE_URL exists (Production/Render environment)
const isProduction = process.env.DATABASE_URL;

const pool = isProduction
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required by Supabase/Render for secure encrypted connections
    },
  })
  : new Pool({
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
    if (!isProduction) {
      console.error('Please check your .env file and ensure PostgreSQL is running');
    }
  } else {
    const dbType = isProduction ? 'Supabase Cloud' : 'Local';
    const dbName = isProduction ? 'production' : (process.env.DB_NAME || 'campus_events');

    console.log(`✅ Successfully connected to ${dbType} PostgreSQL Database.`);
    console.log(`Database Context: ${dbName}`);
    console.log(`Timestamp: ${res.rows[0].now}`);
  }
});

module.exports = pool;