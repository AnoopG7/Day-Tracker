import { z } from 'zod';
import { MEAL_TYPES, DATA_SOURCES } from '../models/nutrition.model.js';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createNutritionSchema = z.object({
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  mealType: z.enum(MEAL_TYPES),
  foodName: z.string().min(1).max(100).trim().toLowerCase(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  source: z.enum(DATA_SOURCES).default('manual'),
  notes: z.string().max(500).optional(),
});

export const updateNutritionSchema = createNutritionSchema.partial().omit({ date: true });

export const idParamSchema = z.object({ id: z.string().min(1) });

export type CreateNutritionInput = z.infer<typeof createNutritionSchema>;
export type UpdateNutritionInput = z.infer<typeof updateNutritionSchema>;
