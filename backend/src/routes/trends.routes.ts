import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getWeeklyTrends, getMonthlyTrends, getYearlyTrends, getComparison } from '../controllers/trends.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/trends/weekly - Get last 7 days trend data
router.get('/weekly', getWeeklyTrends);

// GET /api/trends/monthly - Get last 30 days trend data
router.get('/monthly', getMonthlyTrends);

// GET /api/trends/yearly - Get last 12 months trend data
router.get('/yearly', getYearlyTrends);

// GET /api/trends/comparison - Get today vs yesterday comparison
router.get('/comparison', getComparison);

export default router;
