import { Pool } from 'pg';

// Global teardown per pulire database di test
export default async () => {
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'fantacontratti_user',
    password: process.env.DB_PASSWORD || 'fantacontratti_password',
    database: 'postgres',
  });

  try {
    // Termina tutte le connessioni al database di test
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'users_test'
        AND pid <> pg_backend_pid()
    `);
    
    // Elimina il database di test
    await adminPool.query('DROP DATABASE IF EXISTS users_test');
    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }

  await adminPool.end();
};