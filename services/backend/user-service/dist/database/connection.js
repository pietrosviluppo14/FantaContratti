"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.getPool = exports.connectDatabase = void 0;
const pg_1 = require("pg");
const logger_1 = __importDefault(require("../utils/logger"));
let pool;
const connectDatabase = async () => {
    try {
        pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'fantacontratti_users',
            password: process.env.DB_PASSWORD || 'password',
            port: parseInt(process.env.DB_PORT || '5432'),
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        logger_1.default.info('Database connection established successfully');
    }
    catch (error) {
        logger_1.default.error('Unable to connect to database:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDatabase first.');
    }
    return pool;
};
exports.getPool = getPool;
exports.initializeDatabase = exports.connectDatabase;
const closeDatabase = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        logger_1.default.info('Database connection closed');
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=connection.js.map