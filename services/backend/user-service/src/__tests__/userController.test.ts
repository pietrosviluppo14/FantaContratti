import { Response } from 'express';
import { Pool } from 'pg';
import * as userController from '../controllers/userController';

// Mock del database connection
jest.mock('../database/connection', () => ({
  getPool: jest.fn()
}));

// Mock Kafka service  
jest.mock('../services/kafkaService', () => ({
  publishEvent: jest.fn()
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock errorHandler
jest.mock('../middleware/errorHandler', () => ({
  createError: jest.fn((message: string, statusCode: number) => {
    const error = new Error(message) as any;
    error.statusCode = statusCode;
    return error;
  })
}));

describe('User Controller CRUD - TDD', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockPool: Partial<Pool>;
  let mockGetPool: jest.Mock;

  beforeEach(() => {
    // Setup mock request and response
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Mock pool database
    mockPool = {
      query: jest.fn()
    };

    // Mock getPool function
    const { getPool } = require('../database/connection');
    mockGetPool = getPool as jest.Mock;
    mockGetPool.mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers function', () => {
    it('should be defined', () => {
      expect(userController.getAllUsers).toBeDefined();
    });

    it('should return all users successfully', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          username: 'user1',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 2,
          email: 'user2@example.com',
          username: 'user2',
          created_at: '2025-01-02T00:00:00Z'
        }
      ];

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: mockUsers,
        rowCount: 2
      });

      // Act
      await userController.getAllUsers(mockReq, mockRes as Response);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, email, username, created_at FROM users ORDER BY created_at DESC'
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        total: 2
      });
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act
      await userController.getAllUsers(mockReq, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        total: 0
      });
    });
  });

  describe('getUserById function', () => {
    it('should be defined', () => {
      expect(userController.getUserById).toBeDefined();
    });

    it('should return user by id successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        created_at: '2025-01-01T00:00:00Z'
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      });

      // Act
      await userController.getUserById(mockReq as any, mockRes as Response);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id, email, username, created_at FROM users WHERE id = $1',
        ['1']
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      await expect(userController.getUserById(mockReq as any, mockRes as Response))
        .rejects.toThrow('User not found');
    });
  });

  describe('createUser function', () => {
    it('should be defined', () => {
      expect(userController.createUser).toBeDefined();
    });

    it('should create new user successfully', async () => {
      // Arrange
      mockReq.body = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePassword123!'
      };

      const newUser = {
        id: 3,
        email: 'newuser@example.com',
        username: 'newuser',
        created_at: new Date().toISOString()
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // Check existing user
        .mockResolvedValueOnce({ rows: [newUser], rowCount: 1 }); // Insert new user

      // Act
      await userController.createUser(mockReq, mockRes as Response);

      // Assert
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(mockPool.query).toHaveBeenNthCalledWith(1,
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        ['newuser@example.com', 'newuser']
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: newUser
      });
    });

    it('should fail when user already exists', async () => {
      // Arrange
      mockReq.body = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'SecurePassword123!'
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }); // User exists

      // Act & Assert
      await expect(userController.createUser(mockReq, mockRes as Response))
        .rejects.toThrow('User already exists with this email or username');
    });

    it('should publish Kafka event when user is created', async () => {
      // Arrange
      mockReq.body = {
        email: 'kafka@example.com',
        username: 'kafkauser',
        password: 'SecurePassword123!'
      };

      const newUser = {
        id: 4,
        email: 'kafka@example.com',
        username: 'kafkauser',
        created_at: new Date().toISOString()
      };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [newUser], rowCount: 1 });

      const { publishEvent } = require('../services/kafkaService');

      // Act
      await userController.createUser(mockReq, mockRes as Response);

      // Assert
      expect(publishEvent).toHaveBeenCalledWith('user-events', {
        type: 'USER_CREATED',
        userId: 4,
        data: { email: 'kafka@example.com', username: 'kafkauser' },
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateUser function', () => {
    it('should be defined', () => {
      expect(userController.updateUser).toBeDefined();
    });

    it('should update user successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = {
        email: 'updated@example.com',
        username: 'updateduser'
      };

      const updatedUser = {
        id: 1,
        email: 'updated@example.com',
        username: 'updateduser',
        updated_at: new Date().toISOString()
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [updatedUser],
        rowCount: 1
      });

      // Act
      await userController.updateUser(mockReq, mockRes as Response);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE users SET email = $1, username = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, username, updated_at',
        ['updated@example.com', 'updateduser', '1']
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser
      });
    });

    it('should throw error when user to update not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };
      mockReq.body = {
        email: 'notfound@example.com',
        username: 'notfound'
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      await expect(userController.updateUser(mockReq, mockRes as Response))
        .rejects.toThrow('User not found');
    });

    it('should publish Kafka event when user is updated', async () => {
      // Arrange
      mockReq.params = { id: '1' };
      mockReq.body = {
        email: 'kafka-update@example.com',
        username: 'kafkauserupdated'
      };

      const updatedUser = {
        id: 1,
        email: 'kafka-update@example.com',
        username: 'kafkauserupdated',
        updated_at: new Date().toISOString()
      };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [updatedUser],
        rowCount: 1
      });

      const { publishEvent } = require('../services/kafkaService');

      // Act
      await userController.updateUser(mockReq, mockRes as Response);

      // Assert
      expect(publishEvent).toHaveBeenCalledWith('user-events', {
        type: 'USER_UPDATED',
        userId: '1',
        data: { email: 'kafka-update@example.com', username: 'kafkauserupdated' },
        timestamp: expect.any(String)
      });
    });
  });

  describe('deleteUser function', () => {
    it('should be defined', () => {
      expect(userController.deleteUser).toBeDefined();
    });

    it('should delete user successfully', async () => {
      // Arrange
      mockReq.params = { id: '1' };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      // Act
      await userController.deleteUser(mockReq, mockRes as Response);

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        ['1']
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
    });

    it('should throw error when user to delete not found', async () => {
      // Arrange
      mockReq.params = { id: '999' };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Act & Assert
      await expect(userController.deleteUser(mockReq, mockRes as Response))
        .rejects.toThrow('User not found');
    });

    it('should publish Kafka event when user is deleted', async () => {
      // Arrange
      mockReq.params = { id: '1' };

      (mockPool.query as jest.Mock).mockResolvedValue({
        rows: [{ id: 1 }],
        rowCount: 1
      });

      const { publishEvent } = require('../services/kafkaService');

      // Act
      await userController.deleteUser(mockReq, mockRes as Response);

      // Assert
      expect(publishEvent).toHaveBeenCalledWith('user-events', {
        type: 'USER_DELETED',
        userId: '1',
        timestamp: expect.any(String)
      });
    });
  });

  describe('getUserProfile function', () => {
    it('should be defined', () => {
      expect(userController.getUserProfile).toBeDefined();
    });

    it('should return user profile placeholder', async () => {
      // Act
      await userController.getUserProfile(mockReq, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Profile endpoint' }
      });
    });
  });

  describe('updateUserProfile function', () => {
    it('should be defined', () => {
      expect(userController.updateUserProfile).toBeDefined();
    });

    it('should return profile update placeholder', async () => {
      // Act
      await userController.updateUserProfile(mockReq, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { message: 'Profile updated' }
      });
    });
  });
});
