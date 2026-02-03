import { Response } from 'express';
import {
  DayLog,
  CustomActivity,
  ActivityTemplate,
  NutritionEntry,
  ExpenseEntry,
} from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';

/**
 * @desc    Get dashboard data for a specific date
 * @route   GET /api/dashboard
 * @query   date - YYYY-MM-DD (defaults to today)
 *
 * Returns aggregated data for a single day:
 * - DayLog (sleep, exercise, notes)
 * - Custom activities
 * - Nutrition entries + macro totals
 * - Expense entries + total
 */
export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.query;

  // Default to today if no date provided
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  // Fetch all data in parallel for performance
  const [daylog, activities, nutritionEntries, expenseEntries] = await Promise.all([
    DayLog.findOne({ userId, date: targetDate }),
    CustomActivity.find({ userId, date: targetDate }).sort({ createdAt: -1 }),
    NutritionEntry.find({ userId, date: targetDate }).sort({ createdAt: -1 }),
    ExpenseEntry.find({ userId, date: targetDate }).sort({ createdAt: -1 }),
  ]);

  // Calculate nutrition totals
  const nutritionTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    byMealType: {} as Record<string, { count: number; calories: number }>,
  };

  for (const entry of nutritionEntries) {
    nutritionTotals.calories += entry.calories || 0;
    nutritionTotals.protein += entry.protein || 0;
    nutritionTotals.carbs += entry.carbs || 0;
    nutritionTotals.fats += entry.fats || 0;
    nutritionTotals.fiber += entry.fiber || 0;

    if (!nutritionTotals.byMealType[entry.mealType]) {
      nutritionTotals.byMealType[entry.mealType] = { count: 0, calories: 0 };
    }
    nutritionTotals.byMealType[entry.mealType].count++;
    nutritionTotals.byMealType[entry.mealType].calories += entry.calories || 0;
  }

  // Calculate expense totals
  const expenseTotals = {
    total: 0,
    byCategory: {} as Record<string, { count: number; amount: number }>,
  };

  for (const entry of expenseEntries) {
    expenseTotals.total += entry.amount;

    if (!expenseTotals.byCategory[entry.category]) {
      expenseTotals.byCategory[entry.category] = { count: 0, amount: 0 };
    }
    expenseTotals.byCategory[entry.category].count++;
    expenseTotals.byCategory[entry.category].amount += entry.amount;
  }

  // Calculate activity totals
  let totalActivityMinutes = 0;
  for (const activity of activities) {
    if (activity.duration) {
      totalActivityMinutes += activity.duration;
    } else if (activity.startTime && activity.endTime) {
      const [startH, startM] = activity.startTime.split(':').map(Number);
      const [endH, endM] = activity.endTime.split(':').map(Number);
      const duration = endH * 60 + endM - (startH * 60 + startM);
      totalActivityMinutes += Math.max(0, duration);
    }
  }

  // Get active activity templates from ActivityTemplate table
  const customActivityTemplates = await ActivityTemplate.find({ userId, isActive: true })
    .select('name')
    .lean();
  const templateNames = customActivityTemplates.map((t) => t.name);

  successResponse(
    res,
    {
      date: targetDate,
      daylog: daylog || null,
      activities: {
        items: activities,
        count: activities.length,
        totalMinutes: totalActivityMinutes,
      },
      nutrition: {
        entries: nutritionEntries,
        count: nutritionEntries.length,
        totals: nutritionTotals,
      },
      expenses: {
        entries: expenseEntries,
        count: expenseEntries.length,
        totals: expenseTotals,
      },
      customActivities: {
        templates: templateNames, // Array of active template names from ActivityTemplate
        todayLogs: activities, // Today's custom activity instances
      },
    },
    'Dashboard data fetched'
  );
});
