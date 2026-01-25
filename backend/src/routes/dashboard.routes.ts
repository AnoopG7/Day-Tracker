import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Dashboard endpoint - aggregates all daily data
router.get('/', getDashboard);

export default router;
