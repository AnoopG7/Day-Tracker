import { Response } from 'express';
import { DayLog } from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type { CreateDayLogInput, UpdateDayLogInput } from '../validations/daylog.validation.js';

/**
 * @desc    Get all daylogs for user with pagination and date range
 * @route   GET /api/daylogs
 */
export const getDayLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { page = '1', limit = '30', startDate, endDate } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 30));
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: Record<string, unknown> = { userId };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) (filter.date as Record<string, string>).$gte = startDate as string;
    if (endDate) (filter.date as Record<string, string>).$lte = endDate as string;
  }

  const [daylogs, total] = await Promise.all([
    DayLog.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
    DayLog.countDocuments(filter),
  ]);

  successResponse(res, {
    daylogs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
    },
  }, 'DayLogs fetched successfully');
});

/**
 * @desc    Get today's daylog
 * @route   GET /api/daylogs/today
 */
export const getTodayDayLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let daylog = await DayLog.findOne({ userId, date: today });
  
  // Auto-create if doesn't exist
  if (!daylog) {
    daylog = await DayLog.create({ userId, date: today });
  }

  successResponse(res, daylog, 'Today\'s DayLog fetched');
});

/**
 * @desc    Get daylog by date
 * @route   GET /api/daylogs/:date
 */
export const getDayLogByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  const daylog = await DayLog.findOne({ userId, date });
  if (!daylog) {
    throw new NotFoundError('DayLog not found for this date');
  }

  successResponse(res, daylog, 'DayLog fetched successfully');
});

/**
 * @desc    Create or update daylog (upsert)
 * @route   POST /api/daylogs
 */
export const createOrUpdateDayLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date, ...data } = req.body as CreateDayLogInput;

  const daylog = await DayLog.findOneAndUpdate(
    { userId, date },
    { userId, date, ...data },
    { upsert: true, new: true, runValidators: true }
  );

  successResponse(res, daylog, 'DayLog saved successfully', 201);
});

/**
 * @desc    Update daylog by date
 * @route   PUT /api/daylogs/:date
 */
export const updateDayLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.params;
  const data = req.body as UpdateDayLogInput;

  const daylog = await DayLog.findOneAndUpdate(
    { userId, date },
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!daylog) {
    throw new NotFoundError('DayLog not found');
  }

  successResponse(res, daylog, 'DayLog updated successfully');
});

/**
 * @desc    Delete daylog by date
 * @route   DELETE /api/daylogs/:date
 */
export const deleteDayLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  const daylog = await DayLog.findOneAndDelete({ userId, date });
  if (!daylog) {
    throw new NotFoundError('DayLog not found');
  }

  successResponse(res, null, 'DayLog deleted successfully');
});

/**
 * @desc    Get weekly summary (sleep avg, exercise total)
 * @route   GET /api/daylogs/summary/week
 */
export const getWeeklySummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  
  // Get last 7 days
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const daylogs = await DayLog.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  // Calculate sleep stats
  let totalSleepMinutes = 0;
  let sleepEntryCount = 0;
  let totalExerciseMinutes = 0;
  let exerciseEntryCount = 0;

  for (const log of daylogs) {
    if (log.sleep) {
      if (log.sleep.duration) {
        totalSleepMinutes += log.sleep.duration;
        sleepEntryCount++;
      } else if (log.sleep.startTime && log.sleep.endTime) {
        const [startH, startM] = log.sleep.startTime.split(':').map(Number);
        const [endH, endM] = log.sleep.endTime.split(':').map(Number);
        let duration = (endH * 60 + endM) - (startH * 60 + startM);
        if (duration < 0) duration += 24 * 60; // Overnight sleep
        totalSleepMinutes += duration;
        sleepEntryCount++;
      }
    }
    if (log.exercise) {
      if (log.exercise.duration) {
        totalExerciseMinutes += log.exercise.duration;
        exerciseEntryCount++;
      } else if (log.exercise.startTime && log.exercise.endTime) {
        const [startH, startM] = log.exercise.startTime.split(':').map(Number);
        const [endH, endM] = log.exercise.endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);
        totalExerciseMinutes += Math.max(0, duration);
        exerciseEntryCount++;
      }
    }
  }

  successResponse(res, {
    period: { startDate, endDate },
    daysLogged: daylogs.length,
    sleep: {
      totalMinutes: totalSleepMinutes,
      avgMinutesPerDay: sleepEntryCount > 0 ? Math.round(totalSleepMinutes / sleepEntryCount) : 0,
      avgHoursPerDay: sleepEntryCount > 0 ? Math.round((totalSleepMinutes / sleepEntryCount / 60) * 10) / 10 : 0,
      daysTracked: sleepEntryCount,
    },
    exercise: {
      totalMinutes: totalExerciseMinutes,
      avgMinutesPerDay: exerciseEntryCount > 0 ? Math.round(totalExerciseMinutes / exerciseEntryCount) : 0,
      daysTracked: exerciseEntryCount,
    },
  }, 'Weekly summary fetched');
});

/**
 * @desc    Get current streak (consecutive days with sleep OR exercise logged)
 * @route   GET /api/daylogs/streak
 * 
 * Streak Rule: A day counts if it has:
 * - sleep data (duration OR start/end times), OR
 * - exercise data (duration OR start/end times)
 */
export const getStreak = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  
  // Get last 365 days of logs with sleep/exercise data
  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setDate(yearAgo.getDate() - 365);

  const daylogs = await DayLog.find({
    userId,
    date: { $gte: yearAgo.toISOString().split('T')[0] },
  }).select('date sleep exercise').sort({ date: -1 });

  // Helper to check if activity data exists
  const hasActivityData = (activity: { duration?: number; startTime?: string; endTime?: string } | undefined): boolean => {
    if (!activity) return false;
    return !!(activity.duration || (activity.startTime && activity.endTime));
  };

  // Filter to only days with actual data logged
  const completedDays = daylogs.filter(d => 
    hasActivityData(d.sleep) || hasActivityData(d.exercise)
  );

  if (completedDays.length === 0) {
    successResponse(res, { 
      currentStreak: 0, 
      longestStreak: 0, 
      totalDaysLogged: 0,
      streakRule: 'Day counts if sleep OR exercise is logged',
    }, 'Streak info fetched');
    return;
  }

  const loggedDates = new Set(completedDays.map(d => d.date));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Check from today backwards
  const checkDate = new Date(today);
  let isCurrentStreak = true;

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (loggedDates.has(dateStr)) {
      tempStreak++;
      if (isCurrentStreak) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      isCurrentStreak = false;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);

  successResponse(res, {
    currentStreak,
    longestStreak,
    totalDaysLogged: completedDays.length,
    streakRule: 'Day counts if sleep OR exercise is logged',
  }, 'Streak info fetched');
});
