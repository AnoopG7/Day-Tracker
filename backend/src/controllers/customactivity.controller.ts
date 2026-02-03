import { Response } from 'express';
import { CustomActivity } from '../models/index.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type {
  CreateActivityInput,
  UpdateActivityInput,
} from '../validations/customactivity.validation.js';

/**
 * @desc    Get custom activities with pagination and date range
 * @route   GET /api/activities
 */
export const getActivities = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date, name, startDate, endDate, page = '1', limit = '50' } = req.query;

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
  if (name) filter.name = new RegExp(name as string, 'i');

  const [activities, total] = await Promise.all([
    CustomActivity.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    CustomActivity.countDocuments(filter),
  ]);

  successResponse(
    res,
    {
      activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    },
    'Activities fetched'
  );
});

/**
 * @desc    Get activities for a specific date
 * @route   GET /api/activities/date/:date
 */
export const getActivitiesByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { date } = req.params;

  const activities = await CustomActivity.find({ userId, date }).sort({ createdAt: -1 });

  successResponse(res, activities, 'Activities fetched for date');
});

/**
 * @desc    Get activity by ID
 * @route   GET /api/activities/:id
 */
export const getActivityById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await CustomActivity.findOne({ _id: req.params.id, userId: req.user?.userId });
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  successResponse(res, activity, 'Activity fetched');
});

/**
 * @desc    Create activity
 * @route   POST /api/activities
 */
export const createActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await CustomActivity.create({
    ...(req.body as CreateActivityInput),
    userId: req.user?.userId,
  });
  successResponse(res, activity, 'Activity created', 201);
});

/**
 * @desc    Upsert activity (create or update)
 * @route   PUT /api/activities/upsert
 */
export const upsertActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date, name, duration, notes, startTime, endTime } = req.body as CreateActivityInput;
  const userId = req.user?.userId;

  // Build update data
  const updateData: Partial<CreateActivityInput> = {};
  if (duration !== undefined) updateData.duration = duration;
  if (notes !== undefined) updateData.notes = notes;
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;

  const activity = await CustomActivity.findOneAndUpdate(
    { userId, date, name },
    {
      $set: {
        ...updateData,
        userId,
        date,
        name,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  successResponse(res, activity, 'Activity saved', 200);
});

/**
 * @desc    Update activity
 * @route   PUT /api/activities/:id
 */
export const updateActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await CustomActivity.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.userId },
    { $set: req.body as UpdateActivityInput },
    { new: true, runValidators: true }
  );
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  successResponse(res, activity, 'Activity updated');
});

/**
 * @desc    Delete activity
 * @route   DELETE /api/activities/:id
 */
export const deleteActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const activity = await CustomActivity.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?.userId,
  });
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  successResponse(res, null, 'Activity deleted');
});

/**
 * @desc    Get activity stats (most frequent activities, total time)
 * @route   GET /api/activities/stats
 */
export const getActivityStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { startDate, endDate } = req.query;

  // Default to last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filter: Record<string, unknown> = {
    userId,
    date: {
      $gte: (startDate as string) || thirtyDaysAgo.toISOString().split('T')[0],
      $lte: (endDate as string) || now.toISOString().split('T')[0],
    },
  };

  const activities = await CustomActivity.find(filter);

  // Aggregate by name
  const activityStats: Record<string, { count: number; totalMinutes: number; dates: string[] }> =
    {};

  for (const activity of activities) {
    if (!activityStats[activity.name]) {
      activityStats[activity.name] = { count: 0, totalMinutes: 0, dates: [] };
    }
    activityStats[activity.name].count++;
    activityStats[activity.name].dates.push(activity.date);

    // Calculate duration
    if (activity.duration) {
      activityStats[activity.name].totalMinutes += activity.duration;
    } else if (activity.startTime && activity.endTime) {
      const [startH, startM] = activity.startTime.split(':').map(Number);
      const [endH, endM] = activity.endTime.split(':').map(Number);
      const duration = endH * 60 + endM - (startH * 60 + startM);
      activityStats[activity.name].totalMinutes += Math.max(0, duration);
    }
  }

  // Sort by count
  const sortedStats = Object.entries(activityStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count);

  successResponse(
    res,
    {
      totalActivities: activities.length,
      uniqueActivities: sortedStats.length,
      activities: sortedStats,
    },
    'Activity stats fetched'
  );
});
