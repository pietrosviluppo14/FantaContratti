const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'fantacontratti_users',
  password: 'password123',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('🔄 Testing connection without password (trust auth)...');
    await client.connect();
    console.log('✅ Connected successfully with trust auth!');
    
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful:', result.rows[0].version.substring(0, 50) + '...');
    
    // Test tabelle
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Tables found:', tables.rows.map(r => r.table_name));
    
    await client.end();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('❌ Code:', error.code);
    process.exit(1);
  }
}

testConnection();