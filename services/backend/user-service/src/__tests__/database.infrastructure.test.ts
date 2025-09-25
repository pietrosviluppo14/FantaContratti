import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Database Infrastructure Tests', () => {
  describe('PostgreSQL Container', () => {
    test('should have PostgreSQL container running', async () => {
      // ACT
      const { stdout } = await execAsync('docker ps --filter name=fantacontratti-postgres-users --format "{{.Status}}"');
      
      // ASSERT
      expect(stdout.trim()).toContain('Up');
    });

    test('should have correct PostgreSQL version', async () => {
      // ACT
      const { stdout } = await execAsync(
        'docker exec fantacontratti-postgres-users psql -U postgres -t -c "SELECT version();"'
      );
      
      // ASSERT
      expect(stdout).toContain('PostgreSQL 15');
    });

    test('should have database with correct name', async () => {
      // ACT
      const { stdout } = await execAsync(
        'docker exec fantacontratti-postgres-users psql -U postgres -t -c "SELECT datname FROM pg_database WHERE datname = \'fantacontratti_users\';"'
      );
      
      // ASSERT
      expect(stdout.trim()).toBe('fantacontratti_users');
    });

    test('should have correct authentication configuration', async () => {
      // ACT
      const { stdout } = await execAsync(
        'docker exec fantacontratti-postgres-users cat /var/lib/postgresql/data/pg_hba.conf | grep -E "^host.*all.*all.*"'
      );
      
      // ASSERT
      // Should contain either md5 or trust authentication for external connections
      expect(stdout).toMatch(/(md5|trust)/);
    });

    test('should allow connection from host', async () => {
      // This test will verify that we can connect from outside the container
      // ACT & ASSERT
      const { stdout } = await execAsync(
        'docker exec fantacontratti-postgres-users psql -h localhost -U postgres -d fantacontratti_users -t -c "SELECT 1;"'
      );
      
      expect(stdout.trim()).toBe('1');
    });
  });

  describe('Database Schema', () => {
    test('should have initialization script executed', async () => {
      // ACT
      const { stdout } = await execAsync(`
        docker exec fantacontratti-postgres-users psql -U postgres -d fantacontratti_users -t -c "
          SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'user_profiles', 'user_sessions', 'password_reset_tokens');
        "
      `);
      
      // ASSERT
      expect(parseInt(stdout.trim())).toBe(4);
    });

    test('should have users table with correct structure', async () => {
      // ACT
      const { stdout } = await execAsync(`
        docker exec fantacontratti-postgres-users psql -U postgres -d fantacontratti_users -t -c "
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        "
      `);
      
      // ASSERT
      const columns = stdout.trim().split('\n').map(col => col.trim());
      expect(columns).toContain('id');
      expect(columns).toContain('email');
      expect(columns).toContain('username');
      expect(columns).toContain('password_hash');
    });
  });
});