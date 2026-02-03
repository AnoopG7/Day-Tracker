import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { BadRequestError } from '../utils/errors.js';
import type { AuthRequest } from '../types/index.js';
import { estimateNutritionFromFood } from '../services/ai.service.js';

/**
 * @desc    Estimate nutrition from food name using AI
 * @route   POST /api/ai/nutrition
 * @access  Protected
 */
export const estimateNutrition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { foodName } = req.body;

  if (!foodName || typeof foodName !== 'string' || foodName.trim().length === 0) {
    throw new BadRequestError('Food name is required');
  }

  if (foodName.length > 100) {
    throw new BadRequestError('Food name must be 100 characters or less');
  }

  const nutrition = await estimateNutritionFromFood(foodName.trim());

  successResponse(
    res,
    {
      foodName: foodName.trim(),
      ...nutrition,
    },
    'Nutrition estimated successfully'
  );
});
