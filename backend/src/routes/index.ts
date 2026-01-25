import { Router } from 'express';
import authRoutes from './auth.routes.js';
import daylogRoutes from './daylog.routes.js';
import customactivityRoutes from './customactivity.routes.js';
import nutritionRoutes from './nutrition.routes.js';
import expenseRoutes from './expense.routes.js';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Register routes
router.use('/auth', authRoutes);
router.use('/daylogs', daylogRoutes);
router.use('/activities', customactivityRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/expenses', expenseRoutes);

export default router;
