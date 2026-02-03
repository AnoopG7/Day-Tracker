import { Router } from 'express';
import { estimateNutrition } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// AI endpoints
router.post('/nutrition', estimateNutrition);

export default router;
