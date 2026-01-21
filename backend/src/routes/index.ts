import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Register your routes here
// Example:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);

export default router;
