const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'fantacontratti_users',
  password: 'password123',
  port: 5432,
  connect_timeout: 10000,
  keepAlive: false,
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT version()');
    console.log('✅ Query result:', res.rows[0].version);
    
    await client.end();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Code:', error.code);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();