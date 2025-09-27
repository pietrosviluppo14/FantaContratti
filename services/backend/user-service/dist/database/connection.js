"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = exports.getPool = exports.connectDatabase = void 0;
const pg_1 = require("pg");
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let pool;
const connectDatabase = async () => {
    try {
        if (process.env.NODE_ENV === 'test') {
            dotenv_1.default.config({ path: '.env.test' });
        }
        else if (process.env.NODE_ENV === 'integration') {
            dotenv_1.default.config({ path: '.env.integration' });
        }
        const dbConfig = {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'fantacontratti_users',
            port: parseInt(process.env.DB_PORT || '5432'),
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 15000,
            query_timeout: 10000,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            keepAlive: true,
            keepAliveInitialDelayMillis: 0,
        };
        if (process.env.NODE_ENV === 'test') {
            dbConfig.host = 'localhost';
            const password = process.env.DB_PASSWORD;
            if (password && password.trim() !== '' && password !== 'undefined') {
                dbConfig.password = password;
            }
        }
        else if (process.env.NODE_ENV === 'integration') {
            const password = process.env.DB_PASSWORD;
            if (password && password.trim() !== '' && password !== 'undefined') {
                dbConfig.password = password;
            }
        }
        else {
            const password = process.env.DB_PASSWORD;
            if (password && password.trim() !== '' && password !== 'undefined') {
                dbConfig.password = password;
            }
        }
        logger_1.default.info('Attempting database connection with config:', {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user,
            hasPassword: !!dbConfig.password,
            nodeEnv: process.env.NODE_ENV,
            envDbHost: process.env.DB_HOST,
            envDbPassword: process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]',
        });
        pool = new pg_1.Pool(dbConfig);
        let retries = 5;
        while (retries > 0) {
            try {
                const client = await pool.connect();
                await client.query('SELECT NOW()');
                client.release();
                logger_1.default.info(`Database connection successful on attempt ${6 - retries}`);
                break;
            }
            catch (error) {
                retries--;
                if (retries === 0) {
                    logger_1.default.error('All database connection attempts failed. Last error:', error);
                    throw error;
                }
                logger_1.default.info(`Database connection failed, retrying... (${retries} attempts left)`, {
                    error: error instanceof Error ? error.message : error
                });
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
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