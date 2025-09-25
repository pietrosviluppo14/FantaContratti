const { Pool } = require('pg');

// Load environment files
require('dotenv').config();

// Override with test config if in test mode
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test', override: true });
}

console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', (process.env.DB_PASSWORD || '').length);
console.log('DB_PASSWORD value:', process.env.DB_PASSWORD || '(empty - using trust auth)');

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fantacontratti_users',
  port: parseInt(process.env.DB_PORT || '5432'),
};

// Add password - empty string for trust auth, or the actual password
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length > 0) {
  dbConfig.password = process.env.DB_PASSWORD;
}
// Don't set password field at all for trust auth

console.log('Connection config:', {
  ...dbConfig,
  password: dbConfig.password !== undefined ? (dbConfig.password === '' ? '[EMPTY STRING - TRUST AUTH]' : '[SET]') : '[NOT SET]'
});

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    const result = await client.query('SELECT NOW(), version()');
    console.log('Query result:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();