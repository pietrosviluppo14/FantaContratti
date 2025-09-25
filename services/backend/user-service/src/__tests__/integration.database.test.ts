import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carica variabili d'ambiente per test
dotenv.config();

// Test di integrazione per il database con TIMEOUT e gestione errori
// Questi test usano il database reale PostgreSQL
describe('Database Integration Tests - TDD', () => {
  let testPool: Pool;
  const TEST_TIMEOUT = 15000; // 15 secondi timeout

  beforeAll(async () => {
    // Setup database per integration test con timeout
    testPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'fantacontratti_users',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      connectionTimeoutMillis: 5000, // 5 secondi timeout connessione
      idleTimeoutMillis: 30000,
      max: 5 // Massimo 5 connessioni per test
    });

    // Test di connessione iniziale
    try {
      await testPool.query('SELECT 1');
      console.log('✅ Database connection established for integration tests');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Cleanup dopo tutti i test con timeout
    if (testPool) {
      try {
        await testPool.end();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }, TEST_TIMEOUT);

  beforeEach(async () => {
    // Pulisci dati di test prima di ogni test
    if (testPool) {
      try {
        await testPool.query("DELETE FROM users WHERE email LIKE '%test%'");
      } catch (error) {
        console.warn('Warning: Could not clean test data:', error);
      }
    }
  }, TEST_TIMEOUT);

  describe('Database Connection', () => {
    it('should connect to PostgreSQL database successfully', async () => {
      // Test che la connessione database funzioni
      try {
        const result = await testPool.query('SELECT NOW() as current_time');
        
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].current_time).toBeInstanceOf(Date);
        console.log('✅ Database connection test passed');
      } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should have users table with correct schema', async () => {
      // Test che la tabella users esista con schema corretto
      try {
        const result = await testPool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'users' AND table_schema = 'public'
          ORDER BY ordinal_position
        `);

        expect(result.rows.length).toBeGreaterThan(4); // Almeno le colonne base
        
        const columnNames = result.rows.map(row => row.column_name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('email');
        expect(columnNames).toContain('username');
        expect(columnNames).toContain('password_hash');
        
        console.log('✅ Users table schema validation passed');
        console.log('Columns found:', columnNames);
      } catch (error) {
        console.error('❌ Schema validation failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should perform basic CRUD operations', async () => {
      // Test operazioni CRUD base sul database
      const testUser = {
        email: 'integration.test@example.com',
        username: 'integration_test_user',
        password_hash: '$2b$12$test_hash_for_integration_test'
      };

      try {
        // CREATE
        const insertResult = await testPool.query(
          'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
          [testUser.email, testUser.username, testUser.password_hash]
        );

        expect(insertResult.rows).toHaveLength(1);
        expect(insertResult.rows[0].email).toBe(testUser.email);
        const userId = insertResult.rows[0].id;

        // READ
        const selectResult = await testPool.query(
          'SELECT id, email, username FROM users WHERE id = $1',
          [userId]
        );

        expect(selectResult.rows).toHaveLength(1);
        expect(selectResult.rows[0].email).toBe(testUser.email);

        // UPDATE
        const newUsername = 'updated_integration_test';
        const updateResult = await testPool.query(
          'UPDATE users SET username = $1 WHERE id = $2 RETURNING username',
          [newUsername, userId]
        );

        expect(updateResult.rows).toHaveLength(1);
        expect(updateResult.rows[0].username).toBe(newUsername);

        // DELETE
        const deleteResult = await testPool.query(
          'DELETE FROM users WHERE id = $1 RETURNING id',
          [userId]
        );

        expect(deleteResult.rows).toHaveLength(1);
        expect(deleteResult.rows[0].id).toBe(userId);

        console.log('✅ CRUD operations test passed');
      } catch (error) {
        console.error('❌ CRUD operations failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should handle database constraints correctly', async () => {
      // Test che i constraint del database funzionino
      try {
        // Test unique constraint su email
        const duplicateEmail = 'duplicate.test@example.com';
        
        await testPool.query(
          'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)',
          [duplicateEmail, 'user1', 'hash1']
        );

        // Questo dovrebbe fallire per unique constraint
        await expect(
          testPool.query(
            'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3)',
            [duplicateEmail, 'user2', 'hash2']
          )
        ).rejects.toThrow();

        console.log('✅ Database constraints test passed');
      } catch (error) {
        console.error('❌ Database constraints test failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);
  });

  describe('Database Performance', () => {
    it('should handle multiple concurrent connections', async () => {
      // Test connessioni concorrenti
      try {
        const promises = [];
        
        for (let i = 0; i < 3; i++) {
          const promise = testPool.query('SELECT $1 as test_number', [i]);
          promises.push(promise);
        }

        const results = await Promise.all(promises);
        
        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.rows[0].test_number).toBe(index);
        });

        console.log('✅ Concurrent connections test passed');
      } catch (error) {
        console.error('❌ Concurrent connections test failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should respond within acceptable time limits', async () => {
      // Test performance - query deve rispondere entro 1 secondo
      try {
        const startTime = Date.now();
        
        await testPool.query('SELECT COUNT(*) FROM users');
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(responseTime).toBeLessThan(1000); // Meno di 1 secondo
        
        console.log(`✅ Database response time: ${responseTime}ms`);
      } catch (error) {
        console.error('❌ Performance test failed:', error);
        throw error;
      }
    }, TEST_TIMEOUT);
  });
});