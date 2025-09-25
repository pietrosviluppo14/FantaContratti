import { connectDatabase, getPool, closeDatabase } from '../database/connection';

describe('Database Integration - TDD Approach', () => {
  beforeAll(async () => {
    // Set integration environment
    process.env.NODE_ENV = 'integration';
    
    // Aumentiamo il timeout per Docker
    jest.setTimeout(30000);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Connection Tests', () => {
    it('should load integration environment variables', () => {
      // RED: Test che le env vars siano caricate
      expect(process.env.NODE_ENV).toBe('integration');
      
      // Queste dovrebbero essere caricate dal .env.integration
      console.log('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD
      });
    });

    it('should connect to PostgreSQL database', async () => {
      // RED: Test di connessione di base
      expect(connectDatabase).toBeDefined();
      
      // GREEN: Implementa la connessione
      await expect(connectDatabase()).resolves.not.toThrow();
      
      // Verifica che il pool sia stato creato
      const pool = getPool();
      expect(pool).toBeDefined();
    });

    it('should execute basic queries', async () => {
      // RED: Test che possiamo eseguire query
      await connectDatabase();
      const pool = getPool();
      
      // GREEN: Query di base
      const result = await pool.query('SELECT version()');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].version).toContain('PostgreSQL');
      
      // Test timestamp
      const timeResult = await pool.query('SELECT NOW() as current_time');
      expect(timeResult.rows[0]).toHaveProperty('current_time');
    });

    it('should access database schema', async () => {
      // RED: Test che possiamo accedere allo schema
      await connectDatabase();
      const pool = getPool();
      
      // GREEN: Verifica tabelle esistenti
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      expect(tablesResult.rows.length).toBeGreaterThan(0);
      
      const tableNames = tablesResult.rows.map(row => row.table_name);
      console.log('Available tables:', tableNames);
      
      // Verifica tabelle attese
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('user_profiles');
      expect(tableNames).toContain('user_sessions');
    });

    it('should perform CRUD operations', async () => {
      // RED: Test operazioni CRUD complete
      await connectDatabase();
      const pool = getPool();
      const client = await pool.connect();
      
      try {
        // CREATE: Inserisci un utente di test
        const insertResult = await client.query(`
          INSERT INTO users (email, password, role, created_at) 
          VALUES ($1, $2, $3, NOW()) 
          RETURNING id, email, role, created_at
        `, ['tdd-test@integration.com', 'hashed_password_test', 'USER']);
        
        expect(insertResult.rows).toHaveLength(1);
        const userId = insertResult.rows[0].id;
        expect(insertResult.rows[0].email).toBe('tdd-test@integration.com');
        
        // READ: Leggi l'utente appena creato
        const selectResult = await client.query(`
          SELECT id, email, role, created_at 
          FROM users 
          WHERE id = $1
        `, [userId]);
        
        expect(selectResult.rows).toHaveLength(1);
        expect(selectResult.rows[0].email).toBe('tdd-test@integration.com');
        expect(selectResult.rows[0].role).toBe('USER');
        
        // UPDATE: Aggiorna l'utente
        const updateResult = await client.query(`
          UPDATE users 
          SET role = $1, updated_at = NOW() 
          WHERE id = $2 
          RETURNING id, role
        `, ['ADMIN', userId]);
        
        expect(updateResult.rows[0].role).toBe('ADMIN');
        
        // DELETE: Rimuovi l'utente di test
        const deleteResult = await client.query(`
          DELETE FROM users 
          WHERE id = $1 
          RETURNING id
        `, [userId]);
        
        expect(deleteResult.rows).toHaveLength(1);
        expect(deleteResult.rows[0].id).toBe(userId);
        
        // Verifica che sia stato eliminato
        const verifyResult = await client.query(`
          SELECT id FROM users WHERE id = $1
        `, [userId]);
        
        expect(verifyResult.rows).toHaveLength(0);
        
      } finally {
        client.release();
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle connection errors gracefully', async () => {
      // RED: Test gestione errori
      
      // Salva configurazione corrente
      const originalEnv = { ...process.env };
      
      try {
        // Imposta configurazione errata
        process.env.DB_HOST = 'nonexistent-host';
        process.env.DB_PORT = '9999';
        
        // Dovrebbe fallire con timeout
        await expect(connectDatabase()).rejects.toThrow();
        
      } finally {
        // Ripristina configurazione
        Object.assign(process.env, originalEnv);
      }
    });

    it('should handle invalid queries', async () => {
      // RED: Test query non valide
      await connectDatabase();
      const pool = getPool();
      
      // Query SQL non valida
      await expect(
        pool.query('SELECT * FROM nonexistent_table')
      ).rejects.toThrow();
      
      // Query con sintassi errata
      await expect(
        pool.query('INVALID SQL SYNTAX')
      ).rejects.toThrow();
    });
  });
});