import { Router } from 'express';
import {
  getDayLogs,
  getTodayDayLog,
  getDayLogByDate,
  createOrUpdateDayLog,
  updateDayLog,
  deleteDayLog,
  getWeeklySummary,
  getStreak,
} from '../controllers/daylog.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createDayLogSchema, updateDayLogSchema, dateParamSchema } from '../validations/daylog.validation.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Analytics routes (must be before :date param routes)
router.get('/today', getTodayDayLog);
router.get('/streak', getStreak);
router.get('/summary/week', getWeeklySummary);

// CRUD routes
router.get('/', getDayLogs);
router.get('/:date', validate(dateParamSchema, 'params'), getDayLogByDate);
router.post('/', validate(createDayLogSchema), createOrUpdateDayLog);
router.put('/:date', validate(dateParamSchema, 'params'), validate(updateDayLogSchema), updateDayLog);
router.delete('/:date', validate(dateParamSchema, 'params'), deleteDayLog);

export default router;
