const { Pool } = require('pg');
require('dotenv').config();

console.log('Using PostgreSQL database');

// Enhanced connection pool configuration for high-scale
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'crackzone_db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Connection pool settings for high concurrency
  max: 20, // Maximum number of clients in the pool
  min: 5,  // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used this many times
  
  // Performance optimizations
  statement_timeout: 30000, // 30 second query timeout
  query_timeout: 30000,
  application_name: 'crackzone_backend',
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Enhanced error handling and monitoring
pool.on('connect', (client) => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('Database connection error:', err);
});

pool.on('acquire', (client) => {
  // Client acquired from pool - can add monitoring here
});

pool.on('remove', (client) => {
  console.log('Client removed from pool');
});

// Connection health check
const checkConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

module.exports = pool;