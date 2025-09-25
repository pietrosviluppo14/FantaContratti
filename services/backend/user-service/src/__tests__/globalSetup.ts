import { Pool } from 'pg';

// Global setup per creare database di test
export default async () => {
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'fantacontratti_user',
    password: process.env.DB_PASSWORD || 'fantacontratti_password',
    database: 'postgres', // Connessione al database di default per creare il test DB
  });

  try {
    // Crea database di test se non esiste
    await adminPool.query('CREATE DATABASE users_test');
    console.log('Test database created successfully');
  } catch (error: any) {
    if (error.code !== '42P04') { // Database already exists
      console.error('Error creating test database:', error);
    }
  }

  // Connetti al database di test e crea le tabelle
  const testPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'fantacontratti_user',
    password: process.env.DB_PASSWORD || 'fantacontratti_password',
    database: 'users_test',
  });

  try {
    // Crea le tabelle per i test (schema simplificato)
    await testPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Test tables created successfully');
  } catch (error) {
    console.error('Error creating test tables:', error);
  }

  await adminPool.end();
  await testPool.end();
};