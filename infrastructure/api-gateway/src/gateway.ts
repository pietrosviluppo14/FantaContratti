/**
 * API Gateway - TDD Implementation
 * Central routing and proxy layer for microservices
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

export function createApiGateway() {
  const app = express();

  // Security middleware
  app.use(helmet({
    frameguard: { action: 'deny' }
  }));
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded, please try again later'
    }
  });
  app.use(limiter);

  // Body parsing with error handling
  app.use(express.json({ 
    limit: '10mb',
    verify: (req: any, res: express.Response, buf: Buffer) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // JSON parsing error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error('JSON parsing error:', err.message);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid JSON format in request body'
      });
    }
    next(err);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Proxy to User Service
  const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';

  app.use('/api/auth', createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/api/auth' },
    logLevel: 'debug',
    timeout: 30000,
    proxyTimeout: 30000,
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to ${userServiceUrl}${req.url}`);
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      
      // Se il body è già stato parsato da express.json(), lo riconvertiamo in stringa
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        console.log('Body:', bodyData);
        
        // Aggiorna i headers per la nuova lunghezza del body
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        
        // Scrivi il body nel proxy request
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

  app.use('/api/users', createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/api/users' },
    timeout: 30000,
    proxyTimeout: 30000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying ${req.method} ${req.url} to ${userServiceUrl}${req.url}`);
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      
      // Se il body è già stato parsato da express.json(), lo riconvertiamo in stringa
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        console.log('Body:', bodyData);
        
        // Aggiorna i headers per la nuova lunghezza del body
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        
        // Scrivi il body nel proxy request
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

  // Future microservices proxies:
  // app.use('/api/contracts', createProxyMiddleware({...}));
  // app.use('/api/notifications', createProxyMiddleware({...}));

  // 404 handler for unknown routes
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

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    
    // Handle payload too large specifically
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

// Start server only if not in test environment
if (require.main === module && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  const app = createApiGateway();
  
  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Proxying to User Service: ${process.env.USER_SERVICE_URL || 'http://localhost:3001'}`);
  });
}