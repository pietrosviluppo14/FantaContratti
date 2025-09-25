"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
exports.default = async () => {
    const adminPool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'fantacontratti_user',
        password: process.env.DB_PASSWORD || 'fantacontratti_password',
        database: 'postgres',
    });
    try {
        await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'users_test'
        AND pid <> pg_backend_pid()
    `);
        await adminPool.query('DROP DATABASE IF EXISTS users_test');
        console.log('Test database cleaned up successfully');
    }
    catch (error) {
        console.error('Error cleaning up test database:', error);
    }
    await adminPool.end();
};
//# sourceMappingURL=globalTeardown.js.map