import dotenv from 'dotenv';
import express, { Express } from 'express';
import connectDB from './config/db.js';
import { corsMiddleware } from './config/cors.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { securityHeaders, globalRateLimiter } from './middlewares/security.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(securityHeaders);
app.use(globalRateLimiter);

// Request logging
app.use(requestLogger);

// Core middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Day-Tracker API',
    version: '1.0.0',
  });
});

// 404 handler for unmatched routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log('\n🚀 Day-Tracker Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`➜  Local:   http://localhost:${PORT}`);
      console.log(`➜  API:     http://localhost:${PORT}/api`);
      console.log(`➜  Health:  http://localhost:${PORT}/api/health`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log('🔒 Security: Headers + Rate Limiting enabled');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
