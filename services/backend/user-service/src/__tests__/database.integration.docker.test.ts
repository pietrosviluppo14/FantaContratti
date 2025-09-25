import { connectDatabase, getPool, closeDatabase } from '../database/connection';

describe('Docker Integration Tests', () => {
  beforeAll(async () => {
    // Set integration environment
    process.env.NODE_ENV = 'integration';
    
    // Wait a bit more for Docker networking to be ready
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Database Connection in Docker', () => {
    it('should connect to PostgreSQL using Docker service name', async () => {
      // ARRANGE
      expect(process.env.NODE_ENV).toBe('integration');
      
      // ACT & ASSERT
      await expect(connectDatabase()).resolves.not.toThrow();
      
      // ASSERT
      const pool = getPool();
      expect(pool).toBeDefined();
      
      // Test a simple query
      const client = await pool.connect();
      const result = await client.query('SELECT version()');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].version).toContain('PostgreSQL');
      client.release();
    });

    it('should execute database operations', async () => {
      // ARRANGE
      await connectDatabase();
      const pool = getPool();
      
      // ACT - Test database schema
      const client = await pool.connect();
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      // ASSERT
      expect(tablesResult.rows.length).toBeGreaterThan(0);
      
      // Should have our expected tables
      const tableNames = tablesResult.rows.map(row => row.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('user_profiles');
      expect(tableNames).toContain('user_sessions');
      
      client.release();
    });

    it('should handle user operations', async () => {
      // ARRANGE
      await connectDatabase();
      const pool = getPool();
      const client = await pool.connect();
      
      try {
        // ACT - Insert test user
        const insertResult = await client.query(`
          INSERT INTO users (email, password, role, created_at) 
          VALUES ($1, $2, $3, NOW()) 
          RETURNING id, email, role
        `, ['integration@test.com', 'hashedpassword', 'USER']);
        
        // ASSERT - User created
        expect(insertResult.rows).toHaveLength(1);
        const userId = insertResult.rows[0].id;
        expect(insertResult.rows[0].email).toBe('integration@test.com');
        expect(insertResult.rows[0].role).toBe('USER');
        
        // ACT - Retrieve user
        const selectResult = await client.query(`
          SELECT id, email, role, created_at 
          FROM users 
          WHERE id = $1
        `, [userId]);
        
        // ASSERT - User retrieved
        expect(selectResult.rows).toHaveLength(1);
        expect(selectResult.rows[0].email).toBe('integration@test.com');
        
        // CLEANUP - Remove test user
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        
      } finally {
        client.release();
      }
    });
  });
});