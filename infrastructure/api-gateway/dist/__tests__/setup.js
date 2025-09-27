"use strict";
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.USER_SERVICE_URL = 'http://localhost:3001';
process.env.CONTRACT_SERVICE_URL = 'http://localhost:3002';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3003';
process.env.ALLOWED_ORIGINS = 'http://localhost:3001,http://localhost:3002';
expect.extend({
    toBeHealthy(received) {
        const pass = received && received.status === 'healthy';
        return {
            message: () => `expected ${received} to have healthy status`,
            pass,
        };
    },
});
jest.setTimeout(10000);
//# sourceMappingURL=setup.js.map