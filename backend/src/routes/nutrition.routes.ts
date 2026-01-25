import { Router } from 'express';
import {
  getNutritionEntries,
  getNutritionById,
  createNutrition,
  updateNutrition,
  deleteNutrition,
  getDailySummary,
  getWeeklySummary,
} from '../controllers/nutrition.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createNutritionSchema, updateNutritionSchema, idParamSchema } from '../validations/nutrition.validation.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Analytics routes (must be before :id param routes)
router.get('/summary/daily', getDailySummary);
router.get('/summary/weekly', getWeeklySummary);

// CRUD routes
router.get('/', getNutritionEntries);
router.get('/:id', validate(idParamSchema, 'params'), getNutritionById);
router.post('/', validate(createNutritionSchema), createNutrition);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateNutritionSchema), updateNutrition);
router.delete('/:id', validate(idParamSchema, 'params'), deleteNutrition);

export default router;
