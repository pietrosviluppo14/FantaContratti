// Setup test environment
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'fantacontratti_users';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_only';

// Aumenta timeout per operazioni database
jest.setTimeout(30000);

// Mock console.log durante i test per output pulito
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};