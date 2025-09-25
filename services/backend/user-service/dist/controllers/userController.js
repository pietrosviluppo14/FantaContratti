"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const kafkaService_1 = require("../services/kafkaService");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const getAllUsers = async (_req, res) => {
    try {
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('SELECT id, email, username, created_at FROM users ORDER BY created_at DESC');
        res.json({
            success: true,
            data: result.rows,
            total: result.rowCount
        });
    }
    catch (error) {
        logger_1.default.error('Get all users error:', error);
        throw error;
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const { id } = req.params;
    const pool = (0, connection_1.getPool)();
    const result = await pool.query('SELECT id, email, username, created_at FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const pool = (0, connection_1.getPool)();
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            throw (0, errorHandler_1.createError)('User already exists with this email or username', 400);
        }
        const result = await pool.query('INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at', [email, username, password]);
        const newUser = result.rows[0];
        await (0, kafkaService_1.publishEvent)('user-events', {
            type: 'USER_CREATED',
            userId: newUser.id,
            data: { email, username },
            timestamp: new Date().toISOString()
        });
        logger_1.default.info(`New user created: ${email}`);
        res.status(201).json({
            success: true,
            data: newUser
        });
    }
    catch (error) {
        logger_1.default.error('Create user error:', error);
        throw error;
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, username } = req.body;
    const pool = (0, connection_1.getPool)();
    const result = await pool.query('UPDATE users SET email = $1, username = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, username, updated_at', [email, username, id]);
    if (result.rowCount === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    const updatedUser = result.rows[0];
    await (0, kafkaService_1.publishEvent)('user-events', {
        type: 'USER_UPDATED',
        userId: id,
        data: { email, username },
        timestamp: new Date().toISOString()
    });
    res.json({
        success: true,
        data: updatedUser
    });
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const pool = (0, connection_1.getPool)();
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    await (0, kafkaService_1.publishEvent)('user-events', {
        type: 'USER_DELETED',
        userId: id,
        timestamp: new Date().toISOString()
    });
    res.json({
        success: true,
        message: 'User deleted successfully'
    });
};
exports.deleteUser = deleteUser;
const getUserProfile = async (_req, res) => {
    try {
        res.json({ success: true, data: { message: 'Profile endpoint' } });
    }
    catch (error) {
        logger_1.default.error('Get user profile error:', error);
        throw error;
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (_req, res) => {
    try {
        res.json({ success: true, data: { message: 'Profile updated' } });
    }
    catch (error) {
        logger_1.default.error('Update user profile error:', error);
        throw error;
    }
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=userController.js.map