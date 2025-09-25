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
        await adminPool.query('CREATE DATABASE users_test');
        console.log('Test database created successfully');
    }
    catch (error) {
        if (error.code !== '42P04') {
            console.error('Error creating test database:', error);
        }
    }
    const testPool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'fantacontratti_user',
        password: process.env.DB_PASSWORD || 'fantacontratti_password',
        database: 'users_test',
    });
    try {
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
    }
    catch (error) {
        console.error('Error creating test tables:', error);
    }
    await adminPool.end();
    await testPool.end();
};
//# sourceMappingURL=globalSetup.js.map