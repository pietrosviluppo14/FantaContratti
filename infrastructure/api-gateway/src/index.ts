import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Service routes configuration
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

// Create proxy middleware for each service
Object.entries(services).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware({
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
    }
  }));
});

// 404 handler
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
  Object.keys(services).forEach(route => {
    logger.info(`  ${route} -> ${services[route].target}`);
  });
});