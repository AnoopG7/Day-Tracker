import { Response } from 'express';
import { NutritionEntry } from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type { CreateNutritionInput, UpdateNutritionInput } from '../validations/nutrition.validation.js';

/**
 * @desc    Get nutrition entries with pagination, date range, and meal type filter
 * @route   GET /api/nutrition
 */
export const getNutritionEntries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date, mealType, startDate, endDate, page = '1', limit = '50' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));

  // Build filter
  const filter: Record<string, unknown> = { userId };
  if (date) {
    filter.date = date;
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as Record<string, string>).$gte = startDate as string;
    if (endDate) (filter.date as Record<string, string>).$lte = endDate as string;
  }
  if (mealType) filter.mealType = mealType;

  const [entries, total] = await Promise.all([
    NutritionEntry.find(filter).sort({ date: -1, createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    NutritionEntry.countDocuments(filter),
  ]);

  successResponse(res, {
    entries,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
    },
  }, 'Nutrition entries fetched');
});

/**
 * @desc    Get nutrition entry by ID
 * @route   GET /api/nutrition/:id
 */
export const getNutritionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await NutritionEntry.findOne({ _id: req.params.id, userId: req.user?.userId });
  if (!entry) {
    throw new NotFoundError('Nutrition entry not found');
  }
  successResponse(res, entry, 'Entry fetched');
});

/**
 * @desc    Create nutrition entry
 * @route   POST /api/nutrition
 */
export const createNutrition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await NutritionEntry.create({
    ...req.body as CreateNutritionInput,
    userId: req.user?.userId,
  });
  successResponse(res, entry, 'Nutrition entry created', 201);
});

/**
 * @desc    Update nutrition entry
 * @route   PUT /api/nutrition/:id
 */
export const updateNutrition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const entry = await NutritionEntry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.userId },
    { $set: req.body as UpdateNutritionInput },
    { new: true, runValidators: true }
  );
  if (!entry) {
    throw new NotFoundError('Nutrition entry not found');
  }
  successResponse(res, entry, 'Entry updated');
});

/**
 * @desc    Delete nutrition entry (single) or all entries for a date (bulk)
 * @route   DELETE /api/nutrition/:id
 * @route   DELETE /api/nutrition/date/:date
 */
export const deleteNutrition = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, date } = req.params;
  const userId = req.user?.userId;
  
  // Bulk delete by date
  if (date) {
    const result = await NutritionEntry.deleteMany({ userId, date });
    successResponse(res, { deletedCount: result.deletedCount }, `Deleted ${result.deletedCount} nutrition entries`);
    return;
  }
  
  // Single delete by ID
  const entry = await NutritionEntry.findOneAndDelete({ _id: id, userId });
  if (!entry) {
    throw new NotFoundError('Nutrition entry not found');
  }
  successResponse(res, null, 'Entry deleted');
});

/**
 * @desc    Get daily nutrition summary (total macros)
 * @route   GET /api/nutrition/summary/daily
 */
export const getDailySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.query;
  
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const entries = await NutritionEntry.find({ userId, date: targetDate });

  const summary = {
    date: targetDate,
    totalEntries: entries.length,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
    byMealType: {} as Record<string, { count: number; calories: number }>,
  };

  for (const entry of entries) {
    summary.totalCalories += entry.calories || 0;
    summary.totalProtein += entry.protein || 0;
    summary.totalCarbs += entry.carbs || 0;
    summary.totalFats += entry.fats || 0;
    summary.totalFiber += entry.fiber || 0;

    if (!summary.byMealType[entry.mealType]) {
      summary.byMealType[entry.mealType] = { count: 0, calories: 0 };
    }
    summary.byMealType[entry.mealType].count++;
    summary.byMealType[entry.mealType].calories += entry.calories || 0;
  }

  successResponse(res, summary, 'Daily nutrition summary fetched');
});

/**
 * @desc    Get weekly nutrition summary
 * @route   GET /api/nutrition/summary/weekly
 */
export const getWeeklySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const entries = await NutritionEntry.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  // Aggregate by date
  const dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fats: number; entries: number }> = {};

  for (const entry of entries) {
    if (!dailyTotals[entry.date]) {
      dailyTotals[entry.date] = { calories: 0, protein: 0, carbs: 0, fats: 0, entries: 0 };
    }
    dailyTotals[entry.date].calories += entry.calories || 0;
    dailyTotals[entry.date].protein += entry.protein || 0;
    dailyTotals[entry.date].carbs += entry.carbs || 0;
    dailyTotals[entry.date].fats += entry.fats || 0;
    dailyTotals[entry.date].entries++;
  }

  const daysWithData = Object.keys(dailyTotals).length;
  const totalCalories = Object.values(dailyTotals).reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = Object.values(dailyTotals).reduce((sum, d) => sum + d.protein, 0);

  successResponse(res, {
    period: { startDate, endDate },
    totalEntries: entries.length,
    daysWithData,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: Object.values(dailyTotals).reduce((sum, d) => sum + d.carbs, 0),
      fats: Object.values(dailyTotals).reduce((sum, d) => sum + d.fats, 0),
    },
    averages: {
      caloriesPerDay: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0,
      proteinPerDay: daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0,
    },
    dailyBreakdown: dailyTotals,
  }, 'Weekly nutrition summary fetched');
});
