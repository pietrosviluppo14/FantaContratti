import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool } from '../database/connection';
import { publishEvent } from '../services/kafkaService';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

// Interfacce per type safety
interface UserPayload {
  id: number;
  email: string;
  username: string;
}

interface AuthResponse {
  success: boolean;
  data: {
    user: UserPayload;
    token: string;
    refreshToken: string;
  };
}

// Utility function per generare JWT tokens
const generateTokens = (user: UserPayload) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    jwtSecret,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

/**
 * Register new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
      throw createError('User already exists with this email or username', 400);
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, created_at`,
      [email, username, password_hash]
    );

    const newUser = result.rows[0];
    
    // Generate tokens
    const { token, refreshToken } = generateTokens({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    });

    // Publish event to Kafka
    await publishEvent('user-events', {
      type: 'USER_REGISTERED',
      userId: newUser.id,
      data: { email, username },
      timestamp: new Date().toISOString()
    });

    logger.info(`New user registered: ${email}`);

    // Send response
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
    } as AuthResponse);

  } catch (error) {
    logger.error('Registration error:', error);
    throw error; // Sarà gestito dal middleware errorHandler
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const pool = getPool();

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, username, password_hash, is_active, is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      throw createError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw createError('Account is deactivated', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Update last login
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Publish event to Kafka
    await publishEvent('user-events', {
      type: 'USER_LOGIN',
      userId: user.id,
      data: { email: user.email },
      timestamp: new Date().toISOString()
    });

    logger.info(`User logged in: ${email}`);

    // Send response
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
    } as AuthResponse);

  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In una implementazione completa, dovremmo:
    // 1. Invalidare il token JWT (blacklist)
    // 2. Rimuovere i refresh token dal database
    // 3. Pulire le sessioni

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw createError('Refresh token is required', 400);
    }

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }

    // Verify refresh token
    const decoded = jwt.verify(token, jwtRefreshSecret) as any;
    
    // Generate new tokens
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

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid refresh token', 401);
    }
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Forgot password - Request password reset
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const pool = getPool();

    // Check if user exists
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rowCount === 0) {
      // Per sicurezza, non rivelare se l'email esiste o meno
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
      return;
    }

    const user = result.rows[0];

    // Generate password reset token
    jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // In una implementazione completa:
    // 1. Salvare il token nel database
    // 2. Inviare email con link di reset
    
    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw createError('Token and new password are required', 400);
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'password_reset') {
      throw createError('Invalid reset token', 401);
    }

    const pool = getPool();

    // Hash new password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, decoded.userId]
    );

    // Publish event to Kafka
    await publishEvent('user-events', {
      type: 'PASSWORD_RESET',
      userId: decoded.userId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Password reset completed for user ID: ${decoded.userId}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid or expired reset token', 401);
    }
    logger.error('Reset password error:', error);
    throw error;
  }
};
