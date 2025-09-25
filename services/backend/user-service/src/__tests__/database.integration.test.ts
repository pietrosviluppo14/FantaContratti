import { connectDatabase, closeDatabase, getPool } from '../database/connection';
import { Pool } from 'pg';

describe('Database Integration Tests', () => {
  afterEach(async () => {
    try {
      await closeDatabase();
    } catch (error) {
      // Ignore close errors in tests
    }
  });

  describe('Database Connection', () => {
    test('should connect to database successfully', async () => {
      // ARRANGE - Setup is handled by connectDatabase

      // ACT
      await expect(connectDatabase()).resolves.not.toThrow();
      
      // ASSERT
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(pool).toBeInstanceOf(Pool);
    });

    test('should execute basic queries', async () => {
      // ARRANGE
      await connectDatabase();
      const pool = getPool();

      // ACT
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');

      // ASSERT
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].current_time).toBeDefined();
      expect(result.rows[0].pg_version).toBeDefined();
      expect(result.rows[0].pg_version).toContain('PostgreSQL');
    });

    test('should have correct database schema tables', async () => {
      // ARRANGE
      await connectDatabase();
      const pool = getPool();

      // ACT
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      // ASSERT
      const tableNames = result.rows.map(row => row.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('user_profiles');
      expect(tableNames).toContain('user_sessions');
      expect(tableNames).toContain('password_reset_tokens');
    });

    test('should handle connection errors gracefully', async () => {
      // ARRANGE - Set wrong database config
      const originalEnv = process.env;
      process.env.DB_PASSWORD = 'wrong_password';
      process.env.DB_HOST = 'nonexistent_host';

      // ACT & ASSERT
      await expect(connectDatabase()).rejects.toThrow();

      // CLEANUP
      process.env = originalEnv;
    });
  });

  describe('Database Operations', () => {
    beforeEach(async () => {
      await connectDatabase();
    });

    test('should create and retrieve a test user', async () => {
      // ARRANGE
      const pool = getPool();
      const testUser = {
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      };

      // ACT - Insert test user
      const insertResult = await pool.query(`
        INSERT INTO users (email, username, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, username, first_name, last_name
      `, [testUser.email, testUser.username, testUser.password_hash, testUser.first_name, testUser.last_name]);

      // ASSERT - User was created
      expect(insertResult.rows).toHaveLength(1);
      const createdUser = insertResult.rows[0];
      expect(createdUser.email).toBe(testUser.email);
      expect(createdUser.username).toBe(testUser.username);

      // ACT - Retrieve user
      const selectResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [testUser.email]
      );

      // ASSERT - User can be retrieved
      expect(selectResult.rows).toHaveLength(1);
      expect(selectResult.rows[0].email).toBe(testUser.email);

      // CLEANUP - Delete test user
      await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    });

    test('should handle database constraints', async () => {
      // ARRANGE
      const pool = getPool();
      const duplicateEmail = 'duplicate@example.com';

      // Insert first user
      await pool.query(`
        INSERT INTO users (email, username, password_hash)
        VALUES ($1, $2, $3)
      `, [duplicateEmail, 'user1', 'hash1']);

      // ACT & ASSERT - Try to insert duplicate email
      await expect(
        pool.query(`
          INSERT INTO users (email, username, password_hash)
          VALUES ($1, $2, $3)
        `, [duplicateEmail, 'user2', 'hash2'])
      ).rejects.toThrow();

      // CLEANUP
      await pool.query('DELETE FROM users WHERE email = $1', [duplicateEmail]);
    });
  });
});