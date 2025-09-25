const { Pool } = require('pg');

const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'fantacontratti_users',
  password: 'password',
  port: 5432,
};

const pool = new Pool(config);

async function testConnection() {
  try {
    console.log('Attempting connection with config:', config);
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('✅ Query result:', result.rows[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      severity: error.severity,
      file: error.file,
      line: error.line,
      routine: error.routine
    });
    await pool.end();
    process.exit(1);
  }
}

testConnection();