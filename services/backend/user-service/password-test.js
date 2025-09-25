const { Pool } = require('pg');

const passwords = [
  'password123',
  'postgres', 
  'password',
  'admin',
  '',  // nessuna password
];

async function testPasswords() {
  console.log('🔍 Test password multiple...');
  
  for (const pass of passwords) {
    console.log(`\n🧪 Testing password: "${pass || 'EMPTY'}"`);
    
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'fantacontratti_users',
      user: 'postgres',
      password: pass,
      connectTimeoutMS: 3000
    };
    
    const pool = new Pool(config);
    
    try {
      const client = await pool.connect();
      console.log(`✅ SUCCESS! Password corretta: "${pass || 'EMPTY'}"`);
      
      const result = await client.query('SELECT version()');
      console.log('✅ Database version:', result.rows[0].version.substring(0, 50));
      
      client.release();
      await pool.end();
      
      console.log(`\n🎉 TROVATA! Password PostgreSQL: "${pass || 'EMPTY'}"`);
      return pass;
      
    } catch (error) {
      console.log(`❌ "${pass || 'EMPTY'}" - ${error.message.substring(0, 50)}`);
      await pool.end();
    }
  }
  
  console.log('\n💥 Nessuna password funziona - problema più profondo');
  return null;
}

testPasswords();