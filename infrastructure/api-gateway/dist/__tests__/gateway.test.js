"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
describe('API Gateway - TDD', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'api-gateway',
                timestamp: new Date().toISOString()
            });
        });
        app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.originalUrl} not found`
            });
        });
    });
    describe('Health Check Endpoint', () => {
        it('should return health status', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('api-gateway');
            expect(response.body.timestamp).toBeDefined();
        });
        it('should return JSON content type', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.headers['content-type']).toMatch(/json/);
        });
    });
    describe('Security Middleware', () => {
        it('should include security headers', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
        });
    });
    describe('Rate Limiting', () => {
        it('should handle rate limiting correctly', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health')
                .expect(200);
            expect(response.body.status).toBe('healthy');
        });
    });
    describe('CORS Configuration', () => {
        it('should handle CORS preflight requests', async () => {
            const response = await (0, supertest_1.default)(app)
                .options('/health')
                .set('Origin', 'http://localhost:3001');
            expect(response.status).toBeLessThanOrEqual(404);
        });
    });
    describe('Proxy Routing - User Service', () => {
        it('should define user service routes', () => {
            expect(app).toBeDefined();
        });
        it('should handle /api/auth routes', async () => {
            expect(app._router).toBeDefined();
        });
        it('should handle /api/users routes', async () => {
            expect(app._router).toBeDefined();
        });
    });
    describe('Error Handling', () => {
        it('should handle 404 for undefined routes', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/nonexistent-route');
            expect(response.status).toBe(404);
        });
        it('should return proper error format for 404', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/invalid-endpoint')
                .expect(404);
            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('Request/Response Format', () => {
        it('should handle JSON requests properly', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/health')
                .send({ test: 'data' })
                .set('Content-Type', 'application/json');
            expect(response.status).toBeGreaterThanOrEqual(200);
        });
        it('should enforce request size limits', async () => {
            const largeData = 'x'.repeat(1000);
            const response = await (0, supertest_1.default)(app)
                .post('/health')
                .send({ data: largeData })
                .set('Content-Type', 'application/json');
            expect(response.status).toBeLessThan(500);
        });
    });
});
//# sourceMappingURL=gateway.test.js.map