import express, { Express } from 'express';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { corsMiddleware } from './config/cors.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app: Express = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log('\n🚀 Day-Tracker Backend Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`➜  Local:   http://localhost:${env.PORT}`);
      console.log(`➜  API:     http://localhost:${env.PORT}/api`);
      console.log(`➜  Health:  http://localhost:${env.PORT}/api/health`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

