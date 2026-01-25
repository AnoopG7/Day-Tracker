/**
 * Express app instance for testing
 * Separated from index.ts to allow supertest to use it without starting server
 */
import express, { Express } from 'express';
import { corsMiddleware } from './config/cors.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { securityHeaders } from './middlewares/security.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';

const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(securityHeaders);

  // Request logging (skip in test)
  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

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

  // 404 handler
  app.use(notFound);

  // Error handling middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
