import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDailySummary,
  getMonthlySummary,
  getCategoryBreakdown,
} from '../controllers/expense.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createExpenseSchema, updateExpenseSchema, idParamSchema } from '../validations/expense.validation.js';

const router = Router();

// All routes are protected
router.use(authenticate);

// Analytics routes (must be before :id param routes)
router.get('/summary/daily', getDailySummary);
router.get('/summary/monthly', getMonthlySummary);
router.get('/by-category', getCategoryBreakdown);

// CRUD routes
router.get('/', getExpenses);
router.get('/:id', validate(idParamSchema, 'params'), getExpenseById);
router.post('/', validate(createExpenseSchema), createExpense);
router.put('/:id', validate(idParamSchema, 'params'), validate(updateExpenseSchema), updateExpense);
router.delete('/:id', validate(idParamSchema, 'params'), deleteExpense);

export default router;
