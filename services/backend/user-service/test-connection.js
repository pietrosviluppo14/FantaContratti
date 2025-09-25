// Test di connessione diretta al database Docker
require('dotenv').config({ path: '.env.integration' });

const { Pool } = require('pg');

console.log('Environment:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');

const connectionConfig = {
  host: 'localhost',  // Dal host Windows verso container
  port: 5432,
  database: 'fantacontratti_users',
  user: 'postgres', 
  password: 'password123',  // Password hardcoded per test
  connectTimeoutMS: 30000,
  idleTimeoutMillis: 10000
};

console.log('Configurazione connessione:', {
  ...connectionConfig,
  password: '[HIDDEN]'
});

async function testConnection() {
  const pool = new Pool(connectionConfig);
  
  try {
    console.log('Tentativo di connessione al database...');
    const client = await pool.connect();
    console.log('✅ Connessione riuscita!');
    
    const result = await client.query('SELECT version()');
    console.log('✅ Query riuscita:', result.rows[0].version);
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('✅ Tabelle disponibili:', tablesResult.rows.map(r => r.table_name));
    
    client.release();
    console.log('✅ Test completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error('Codice errore:', error.code);
  } finally {
    await pool.end();
  }
}

testConnection();