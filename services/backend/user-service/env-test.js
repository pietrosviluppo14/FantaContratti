require('dotenv').config({ path: '.env.integration' });

console.log('🔍 Debug Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

// Test con la configurazione esatta dal .env.integration
const { Pool } = require('pg');

const config = {
  host: 'localhost', // Test host Windows -> Docker
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fantacontratti_users',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  connectTimeoutMS: 5000
};

console.log('\n🧪 Test configurazione environment:');
console.log(JSON.stringify({...config, password: '[HIDDEN]'}, null, 2));

async function testWithEnvConfig() {
  const pool = new Pool(config);
  
  try {
    console.log('\n📡 Connessione in corso...');
    const client = await pool.connect();
    console.log('✅ SUCCESS! Connesso con configurazione environment!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query OK:', result.rows[0]);
    
    client.release();
    return true;
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error('❌ Codice:', error.code);
    return false;
    
  } finally {
    await pool.end();
  }
}

testWithEnvConfig();