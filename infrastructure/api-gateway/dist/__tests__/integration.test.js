"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const gateway_1 = require("../gateway");
describe('API Gateway Integration - TDD', () => {
    let app;
    beforeAll(() => {
        app = (0, gateway_1.createApiGateway)();
    });
    describe('Security Middleware', () => {
        it('should add security headers', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBe('DENY');
        });
        it('should handle CORS properly', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .set('Origin', 'http://localhost:5173');
            expect(response.status).toBe(200);
        });
        it('should apply rate limiting headers', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.headers['x-ratelimit-limit']).toBeTruthy();
            expect(response.headers['x-ratelimit-remaining']).toBeTruthy();
        });
    });
    describe('Proxy Error Handling', () => {
        it('should handle unavailable user service gracefully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password' });
            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Service Unavailable');
            expect(response.body.message).toContain('authentication service');
        });
        it('should handle unavailable user service for users endpoint', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/users');
            expect(response.status).toBe(503);
            expect(response.body.error).toBe('Service Unavailable');
            expect(response.body.message).toContain('User service');
        });
    });
    describe('Request Validation', () => {
        it('should handle large JSON payloads within limit', async () => {
            const largePayload = {
                data: 'x'.repeat(1000),
                email: 'test@example.com'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(largePayload);
            expect(response.status).toBe(503);
        });
        it('should reject extremely large payloads', async () => {
            const extremelyLargePayload = {
                data: 'x'.repeat(11 * 1024 * 1024)
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(extremelyLargePayload);
            expect(response.status).toBe(413);
        });
    });
    describe('Error Handling', () => {
        it('should handle unknown routes with helpful message', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/unknown-service/test')
                .expect(404);
            expect(response.body.error).toBe('Not Found');
            expect(response.body.availableRoutes).toContain('/api/auth/*');
            expect(response.body.availableRoutes).toContain('/api/users/*');
        });
        it('should preserve route paths in error messages', async () => {
            const testPath = '/api/nonexistent/complex/path';
            const response = await (0, supertest_1.default)(app)
                .get(testPath)
                .expect(404);
            expect(response.body.message).toContain(testPath);
        });
    });
    describe('Health Check Enhanced', () => {
        it('should provide detailed health information', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('api-gateway');
            expect(response.body.timestamp).toBeTruthy();
            expect(response.body.uptime).toBeGreaterThanOrEqual(0);
        });
        it('should respond quickly to health checks', async () => {
            const start = Date.now();
            await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            const duration = Date.now() - start;
            expect(duration).toBeLessThan(100);
        });
    });
});
//# sourceMappingURL=integration.test.js.map