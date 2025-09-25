import { Pool } from 'pg';
import logger from '../utils/logger';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Load appropriate environment file
    if (process.env.NODE_ENV === 'test') {
      dotenv.config({ path: '.env.test' });
    } else if (process.env.NODE_ENV === 'integration') {
      dotenv.config({ path: '.env.integration' });
    }

    // Enhanced connection configuration
    const dbConfig: any = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'fantacontratti_users',
      port: parseInt(process.env.DB_PORT || '5432'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased for Docker networking
      // Enhanced SSL and connection settings
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    // Configure based on environment
    if (process.env.NODE_ENV === 'test') {
      // Test environment configuration
      dbConfig.host = 'localhost';  // Use localhost for Docker host tests
      const password = process.env.DB_PASSWORD;
      if (password && password.trim() !== '' && password !== 'undefined') {
        dbConfig.password = password;
      }
    } else if (process.env.NODE_ENV === 'integration') {
      // Integration environment - Docker network
      // Host will be postgres-users service name
      const password = process.env.DB_PASSWORD;
      if (password && password.trim() !== '' && password !== 'undefined') {
        dbConfig.password = password;
      }
    } else {
      // Production/Development environment
      const password = process.env.DB_PASSWORD;
      if (password && password.trim() !== '' && password !== 'undefined') {
        dbConfig.password = password;
      }
    }

    logger.info('Attempting database connection with config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      hasPassword: !!dbConfig.password,
      nodeEnv: process.env.NODE_ENV,
      envDbHost: process.env.DB_HOST, // For debugging
      envDbPassword: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]', // For debugging
    });

    pool = new Pool(dbConfig);

    // Test the connection with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        logger.info(`Database connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase first.');
  }
  return pool;
};

// Alias per l'inizializzazione nei test
export const initializeDatabase = connectDatabase;

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null as any; // Reset pool reference
    logger.info('Database connection closed');
  }
};