import { Response } from 'express';
import { ExpenseEntry } from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validations/expense.validation.js';

/**
 * @desc    Get expenses with pagination, date range, and category filter
 * @route   GET /api/expenses
 */
export const getExpenses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date, category, startDate, endDate, page = '1', limit = '50' } = req.query;

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
  if (category) filter.category = category;

  const [expenses, total] = await Promise.all([
    ExpenseEntry.find(filter).sort({ date: -1, createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    ExpenseEntry.countDocuments(filter),
  ]);

  // Calculate total amount for filtered results
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  successResponse(res, {
    expenses,
    totalAmount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
    },
  }, 'Expenses fetched');
});

/**
 * @desc    Get expense by ID
 * @route   GET /api/expenses/:id
 */
export const getExpenseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await ExpenseEntry.findOne({ _id: req.params.id, userId: req.user?.userId });
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }
  successResponse(res, expense, 'Expense fetched');
});

/**
 * @desc    Create expense
 * @route   POST /api/expenses
 */
export const createExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await ExpenseEntry.create({
    ...req.body as CreateExpenseInput,
    userId: req.user?.userId,
  });
  successResponse(res, expense, 'Expense created', 201);
});

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 */
export const updateExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await ExpenseEntry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.userId },
    { $set: req.body as UpdateExpenseInput },
    { new: true, runValidators: true }
  );
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }
  successResponse(res, expense, 'Expense updated');
});

/**
 * @desc    Delete expense (single) or all expenses for a date (bulk)
 * @route   DELETE /api/expenses/:id
 * @route   DELETE /api/expenses/date/:date
 */
export const deleteExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, date } = req.params;
  const userId = req.user?.userId;
  
  // Bulk delete by date
  if (date) {
    const result = await ExpenseEntry.deleteMany({ userId, date });
    successResponse(res, { deletedCount: result.deletedCount }, `Deleted ${result.deletedCount} expenses`);
    return;
  }
  
  // Single delete by ID
  const expense = await ExpenseEntry.findOneAndDelete({ _id: id, userId });
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }
  successResponse(res, null, 'Expense deleted');
});

/**
 * @desc    Get daily expense summary
 * @route   GET /api/expenses/summary/daily
 */
export const getDailySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.query;
  
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const expenses = await ExpenseEntry.find({ userId, date: targetDate });

  const summary = {
    date: targetDate,
    totalExpenses: expenses.length,
    totalAmount: 0,
    byCategory: {} as Record<string, { count: number; amount: number }>,
    byPaymentMethod: {} as Record<string, { count: number; amount: number }>,
  };

  for (const expense of expenses) {
    summary.totalAmount += expense.amount;

    // Group by category
    if (!summary.byCategory[expense.category]) {
      summary.byCategory[expense.category] = { count: 0, amount: 0 };
    }
    summary.byCategory[expense.category].count++;
    summary.byCategory[expense.category].amount += expense.amount;

    // Group by payment method
    const method = expense.paymentMethod || 'unknown';
    if (!summary.byPaymentMethod[method]) {
      summary.byPaymentMethod[method] = { count: 0, amount: 0 };
    }
    summary.byPaymentMethod[method].count++;
    summary.byPaymentMethod[method].amount += expense.amount;
  }

  successResponse(res, summary, 'Daily expense summary fetched');
});

/**
 * @desc    Get monthly expense summary
 * @route   GET /api/expenses/summary/monthly
 */
export const getMonthlySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { month, year } = req.query;
  
  const now = new Date();
  const targetYear = parseInt(year as string) || now.getFullYear();
  const targetMonth = parseInt(month as string) || now.getMonth() + 1;

  // Build date range for the month
  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const expenses = await ExpenseEntry.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  // Daily breakdown
  const dailyTotals: Record<string, number> = {};
  const categoryTotals: Record<string, { count: number; amount: number }> = {};

  for (const expense of expenses) {
    // Daily
    if (!dailyTotals[expense.date]) {
      dailyTotals[expense.date] = 0;
    }
    dailyTotals[expense.date] += expense.amount;

    // Category
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = { count: 0, amount: 0 };
    }
    categoryTotals[expense.category].count++;
    categoryTotals[expense.category].amount += expense.amount;
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const daysWithExpenses = Object.keys(dailyTotals).length;

  successResponse(res, {
    period: { year: targetYear, month: targetMonth, startDate, endDate },
    totalExpenses: expenses.length,
    totalAmount,
    averagePerDay: daysWithExpenses > 0 ? Math.round(totalAmount / daysWithExpenses) : 0,
    daysWithExpenses,
    byCategory: categoryTotals,
    dailyBreakdown: dailyTotals,
  }, 'Monthly expense summary fetched');
});

/**
 * @desc    Get category breakdown (for pie charts)
 * @route   GET /api/expenses/by-category
 */
export const getCategoryBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { startDate, endDate } = req.query;

  // Default to current month
  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const defaultEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const filter: Record<string, unknown> = {
    userId,
    date: {
      $gte: (startDate as string) || defaultStart,
      $lte: (endDate as string) || defaultEnd,
    },
  };

  const expenses = await ExpenseEntry.find(filter);

  const categoryBreakdown: Record<string, { count: number; amount: number; percentage: number }> = {};
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  for (const expense of expenses) {
    if (!categoryBreakdown[expense.category]) {
      categoryBreakdown[expense.category] = { count: 0, amount: 0, percentage: 0 };
    }
    categoryBreakdown[expense.category].count++;
    categoryBreakdown[expense.category].amount += expense.amount;
  }

  // Calculate percentages
  for (const category of Object.keys(categoryBreakdown)) {
    categoryBreakdown[category].percentage = totalAmount > 0 
      ? Math.round((categoryBreakdown[category].amount / totalAmount) * 100 * 10) / 10 
      : 0;
  }

  successResponse(res, {
    period: {
      startDate: (startDate as string) || defaultStart,
      endDate: (endDate as string) || defaultEnd,
    },
    totalAmount,
    totalExpenses: expenses.length,
    categories: categoryBreakdown,
  }, 'Category breakdown fetched');
});
