const { Pool } = require('pg');

console.log('🔧 Test connessione diretta alla porta 5432');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'fantacontratti_users', 
  user: 'postgres',
  password: 'password123',
  connectTimeoutMS: 5000
};

async function quickTest() {
  console.log('📡 Tentativo connessione...');
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ CONNESSO! Il database funziona!');
    
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('✅ Query OK - Users count:', result.rows[0].count);
    
    client.release();
    console.log('🎉 SUCCESS: Il problema Docker è risolto!');
    return true;
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.error('❌ Codice:', error.code);
    return false;
    
  } finally {
    await pool.end();
  }
}

quickTest().then(success => {
  if (success) {
    console.log('\n🚀 PROSSIMO STEP: Avviamo il user-service!');
  } else {
    console.log('\n🔧 Dobbiamo sistemare la connessione database');
  }
});