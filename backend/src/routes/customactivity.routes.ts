import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  getActivitiesByDate,
  createActivity,
  upsertActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
} from '../controllers/customactivity.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createActivitySchema, updateActivitySchema, idParamSchema } from '../validations/customactivity.validation.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Analytics routes (must be before :id param routes)
router.get('/stats', getActivityStats);
router.get('/date/:date', getActivitiesByDate);

// CRUD routes
router.get('/', getActivities);
router.get('/:id', validate(idParamSchema, 'params'), getActivityById);
router.put('/upsert', validate(createActivitySchema), upsertActivity); // Upsert route
router.post('/', validate(createActivitySchema), createActivity);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateActivitySchema), updateActivity);
router.delete('/:id', validate(idParamSchema, 'params'), deleteActivity);

export default router;
