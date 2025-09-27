"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiGateway = createApiGateway;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
function createApiGateway() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        frameguard: { action: 'deny' }
    }));
    app.use((0, cors_1.default)({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded, please try again later'
        }
    });
    app.use(limiter);
    app.use(express_1.default.json({
        limit: '10mb',
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && 'body' in err) {
            console.error('JSON parsing error:', err.message);
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid JSON format in request body'
            });
        }
        next(err);
    });
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'api-gateway',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    app.use('/api/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: userServiceUrl,
        changeOrigin: true,
        pathRewrite: { '^/api/auth': '/api/auth' },
        logLevel: 'debug',
        timeout: 30000,
        proxyTimeout: 30000,
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying ${req.method} ${req.url} to ${userServiceUrl}${req.url}`);
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            if (req.body && Object.keys(req.body).length > 0) {
                const bodyData = JSON.stringify(req.body);
                console.log('Body:', bodyData);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Response from ${userServiceUrl}: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error('Proxy error for auth:', err.message);
            console.error('Error details:', err);
            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'User authentication service is temporarily unavailable'
                });
            }
        }
    }));
    app.use('/api/users', (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: userServiceUrl,
        changeOrigin: true,
        pathRewrite: { '^/api/users': '/api/users' },
        timeout: 30000,
        proxyTimeout: 30000,
        logLevel: 'warn',
        onProxyReq: (proxyReq, req, res) => {
            console.log(`Proxying ${req.method} ${req.url} to ${userServiceUrl}${req.url}`);
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            if (req.body && Object.keys(req.body).length > 0) {
                const bodyData = JSON.stringify(req.body);
                console.log('Body:', bodyData);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`Response from ${userServiceUrl}: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error('Proxy error for users:', err.message);
            console.error('Error details:', err);
            if (!res.headersSent) {
                res.status(503).json({
                    error: 'Service Unavailable',
                    message: 'User service is temporarily unavailable'
                });
            }
        }
    }));
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.originalUrl} not found`,
            availableRoutes: [
                '/health',
                '/api/auth/*',
                '/api/users/*'
            ]
        });
    });
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        if (err.type === 'entity.too.large') {
            return res.status(413).json({
                error: 'Payload Too Large',
                message: 'Request payload exceeds the maximum allowed size'
            });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    });
    return app;
}
if (require.main === module && process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    const app = createApiGateway();
    app.listen(PORT, () => {
        console.log(`🚀 API Gateway running on port ${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 Proxying to User Service: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
    });
}
//# sourceMappingURL=gateway.js.map