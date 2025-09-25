const { Pool } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'fantacontratti_users',
  user: 'postgres',
  password: 'password123'
};

console.log('Testing connection with:', {
  ...config,
  password: '[HIDDEN]'
});

async function test() {
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ SUCCESS: Connected to database!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query result:', result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

test();