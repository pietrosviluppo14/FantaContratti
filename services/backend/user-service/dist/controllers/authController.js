"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
const kafkaService_1 = require("../services/kafkaService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const generateTokens = (user) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets not configured');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username }, jwtSecret, { expiresIn: '1h' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwtRefreshSecret, { expiresIn: '7d' });
    return { token, refreshToken };
};
const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const pool = (0, connection_1.getPool)();
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            throw (0, errorHandler_1.createError)('User already exists with this email or username', 400);
        }
        const saltRounds = 12;
        const password_hash = await bcryptjs_1.default.hash(password, saltRounds);
        const result = await pool.query(`INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, created_at`, [email, username, password_hash]);
        const newUser = result.rows[0];
        const { token, refreshToken } = generateTokens({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username
        });
        await (0, kafkaService_1.publishEvent)('user-events', {
            type: 'USER_REGISTERED',
            userId: newUser.id,
            data: { email, username },
            timestamp: new Date().toISOString()
        });
        logger_1.default.info(`New user registered: ${email}`);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username
                },
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        throw error;
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('SELECT id, email, username, password_hash, is_active, is_verified FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            throw (0, errorHandler_1.createError)('Invalid email or password', 401);
        }
        const user = result.rows[0];
        if (!user.is_active) {
            throw (0, errorHandler_1.createError)('Account is deactivated', 401);
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw (0, errorHandler_1.createError)('Invalid email or password', 401);
        }
        const { token, refreshToken } = generateTokens({
            id: user.id,
            email: user.email,
            username: user.username
        });
        await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
        await (0, kafkaService_1.publishEvent)('user-events', {
            type: 'USER_LOGIN',
            userId: user.id,
            data: { email: user.email },
            timestamp: new Date().toISOString()
        });
        logger_1.default.info(`User logged in: ${email}`);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                },
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        throw error;
    }
};
exports.login = login;
const logout = async (_req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Logout error:', error);
        throw error;
    }
};
exports.logout = logout;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            throw (0, errorHandler_1.createError)('Refresh token is required', 400);
        }
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtRefreshSecret) {
            throw new Error('JWT refresh secret not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtRefreshSecret);
        const { token: newToken, refreshToken: newRefreshToken } = generateTokens({
            id: decoded.id,
            email: decoded.email,
            username: decoded.username
        });
        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw (0, errorHandler_1.createError)('Invalid refresh token', 401);
        }
        logger_1.default.error('Token refresh error:', error);
        throw error;
    }
};
exports.refreshToken = refreshToken;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const pool = (0, connection_1.getPool)();
        const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent'
            });
            return;
        }
        const user = result.rows[0];
        jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger_1.default.info(`Password reset requested for: ${email}`);
        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent'
        });
    }
    catch (error) {
        logger_1.default.error('Forgot password error:', error);
        throw error;
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            throw (0, errorHandler_1.createError)('Token and new password are required', 400);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.type !== 'password_reset') {
            throw (0, errorHandler_1.createError)('Invalid reset token', 401);
        }
        const pool = (0, connection_1.getPool)();
        const saltRounds = 12;
        const password_hash = await bcryptjs_1.default.hash(newPassword, saltRounds);
        await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, decoded.userId]);
        await (0, kafkaService_1.publishEvent)('user-events', {
            type: 'PASSWORD_RESET',
            userId: decoded.userId,
            timestamp: new Date().toISOString()
        });
        logger_1.default.info(`Password reset completed for user ID: ${decoded.userId}`);
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw (0, errorHandler_1.createError)('Invalid or expired reset token', 401);
        }
        logger_1.default.error('Reset password error:', error);
        throw error;
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map