/**
 * Test Setup for API Gateway
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.USER_SERVICE_URL = 'http://localhost:3001';
process.env.CONTRACT_SERVICE_URL = 'http://localhost:3002';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3003';
process.env.ALLOWED_ORIGINS = 'http://localhost:3001,http://localhost:3002';

// Extend expect matchers if needed
expect.extend({
  toBeHealthy(received) {
    const pass = received && received.status === 'healthy';
    return {
      message: () => `expected ${received} to have healthy status`,
      pass,
    };
  },
});

// Global test timeout
jest.setTimeout(10000);