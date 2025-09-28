"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple()
        })
    ]
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'api-gateway',
        timestamp: new Date().toISOString()
    });
});
const services = {
    '/api/users': {
        target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        pathRewrite: { '^/api/users': '/api/users' }
    },
    '/api/auth': {
        target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        pathRewrite: { '^/api/auth': '/api/auth' }
    },
    '/api/contracts': {
        target: process.env.CONTRACT_SERVICE_URL || 'http://localhost:3002',
        pathRewrite: { '^/api/contracts': '/api/contracts' }
    },
    '/api/notifications': {
        target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
        pathRewrite: { '^/api/notifications': '/api/notifications' }
    }
};
Object.entries(services).forEach(([path, config]) => {
    app.use(path, (0, http_proxy_middleware_1.createProxyMiddleware)({
        target: config.target,
        changeOrigin: true,
        pathRewrite: config.pathRewrite,
        onError: (err, req, res) => {
            logger.error(`Proxy error for ${path}:`, err);
            res.status(503).json({
                error: 'Service Unavailable',
                message: 'The requested service is currently unavailable'
            });
        },
        onProxyReq: (proxyReq, req, res) => {
            logger.info(`Proxying ${req.method} ${req.originalUrl} to ${config.target}`);
            if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
                proxyReq.end();
                logger.info(`Body data sent: ${bodyData}`);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`);
        }
    }));
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('Available routes:');
    Object.entries(services).forEach(([route, config]) => {
        logger.info(`  ${route} -> ${config.target}`);
    });
});
//# sourceMappingURL=index.js.map