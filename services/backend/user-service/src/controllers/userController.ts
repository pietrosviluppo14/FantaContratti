import { Request, Response } from 'express';
import { publishEvent } from '../services/kafkaService';
import { getPool } from '../database/connection';
import { createError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const pool = getPool();
  const result = await pool.query('SELECT id, email, username, created_at FROM users ORDER BY created_at DESC');
  
  res.json({
    success: true,
    data: result.rows,
    total: result.rowCount
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const pool = getPool();
  
  const result = await pool.query('SELECT id, email, username, created_at FROM users WHERE id = $1', [id]);
  
  if (result.rowCount === 0) {
    throw createError('User not found', 404);
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  const pool = getPool();
  
  // Check if user already exists
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
  
  if (existingUser.rowCount > 0) {
    throw createError('User already exists with this email or username', 400);
  }
  
  const result = await pool.query(
    'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, created_at',
    [email, username, password] // In produzione, hashare la password!
  );
  
  const newUser = result.rows[0];
  
  // Publish event to Kafka
  await publishEvent('user-events', {
    type: 'USER_CREATED',
    userId: newUser.id,
    data: { email, username },
    timestamp: new Date().toISOString()
  });
  
  res.status(201).json({
    success: true,
    data: newUser
  });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, username } = req.body;
  const pool = getPool();
  
  const result = await pool.query(
    'UPDATE users SET email = $1, username = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, username, updated_at',
    [email, username, id]
  );
  
  if (result.rowCount === 0) {
    throw createError('User not found', 404);
  }
  
  const updatedUser = result.rows[0];
  
  // Publish event to Kafka
  await publishEvent('user-events', {
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

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const pool = getPool();
  
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  
  if (result.rowCount === 0) {
    throw createError('User not found', 404);
  }
  
  // Publish event to Kafka
  await publishEvent('user-events', {
    type: 'USER_DELETED',
    userId: id,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  // Implementation for user profile
  res.json({ success: true, data: { message: 'Profile endpoint' } });
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  // Implementation for profile update
  res.json({ success: true, data: { message: 'Profile updated' } });
};