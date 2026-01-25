import { z } from 'zod';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, DATA_SOURCES } from '../models/expense.model.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createExpenseSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  category: z.enum(EXPENSE_CATEGORIES),
  description: z.string().min(1).max(200).trim(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.string().max(3).default('INR'),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  merchant: z.string().max(100).trim().toLowerCase().optional(),
  source: z.enum(DATA_SOURCES).default('manual'),
  notes: z.string().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({ date: true });

export const idParamSchema = z.object({ id: z.string().min(1) });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
