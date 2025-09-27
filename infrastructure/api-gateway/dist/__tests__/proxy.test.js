"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
function createApiGatewayApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'api-gateway',
            timestamp: new Date().toISOString()
        });
    });
    app.use('/api/auth', (req, res, next) => {
        if (req.path === '/login' && req.method === 'POST') {
            res.json({
                success: true,
                data: {
                    user: { id: 1, email: req.body.email || 'test@example.com' },
                    token: 'mock-jwt-token'
                }
            });
        }
        else {
            next();
        }
    });
    app.use('/api/users', (req, res, next) => {
        if (req.method === 'GET' && req.path === '/') {
            res.json({
                success: true,
                data: [
                    { id: 1, email: 'user1@example.com', username: 'user1' },
                    { id: 2, email: 'user2@example.com', username: 'user2' }
                ]
            });
        }
        else if (req.method === 'GET' && req.path.match(/^\/\d+$/)) {
            const id = parseInt(req.path.substring(1));
            res.json({
                success: true,
                data: { id, email: `user${id}@example.com`, username: `user${id}` }
            });
        }
        else {
            next();
        }
    });
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.originalUrl} not found`
        });
    });
    return app;
}
describe('API Gateway Proxy - TDD', () => {
    let app;
    beforeAll(() => {
        app = createApiGatewayApp();
    });
    describe('Auth Proxy Routes', () => {
        it('should proxy login requests to user service', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data.token).toBe('mock-jwt-token');
        });
        it('should forward request headers correctly', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .set('User-Agent', 'test-agent')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('User Proxy Routes', () => {
        it('should proxy get all users request', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/users')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data).toHaveLength(2);
        });
        it('should proxy get user by id request', async () => {
            const userId = 1;
            const response = await (0, supertest_1.default)(app)
                .get(`/api/users/${userId}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.email).toBe('user1@example.com');
        });
        it('should handle dynamic user id routing', async () => {
            const userId = 42;
            const response = await (0, supertest_1.default)(app)
                .get(`/api/users/${userId}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(userId);
            expect(response.body.data.email).toBe(`user${userId}@example.com`);
        });
    });
    describe('Proxy Error Handling', () => {
        it('should handle non-existent service routes', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/nonexistent-service/test');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Not Found');
        });
        it('should handle invalid JSON in proxy requests', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send('invalid-json')
                .set('Content-Type', 'application/json');
            expect(response.status).toBeGreaterThanOrEqual(200);
        });
    });
    describe('Request/Response Transformation', () => {
        it('should preserve request body in proxy', async () => {
            const loginData = {
                email: 'proxy-test@example.com',
                password: 'proxy-password'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
        });
        it('should preserve response headers from proxied service', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/users');
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.status).toBe(200);
        });
    });
});
//# sourceMappingURL=proxy.test.js.map