import { Response } from 'express';
import { DayLog, NutritionEntry, ExpenseEntry, CustomActivity } from '../models/index.js';
import { ActivityTemplate } from '../models/activityTemplate.model.js';
import { User } from '../models/user.model.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import { getTodayInTimezone, getDateInTimezone } from '../utils/timezone.util.js';
import type { AuthRequest } from '../types/index.js';

/**
 * @desc    Get weekly trend data (last 7 days)
 * @route   GET /api/trends/weekly
 */
export const getWeeklyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  // Get user's timezone
  const user = await User.findById(userId).select('timezone');
  const timezone = user?.timezone || 'UTC';

  // Calculate date range (last 7 days including today)
  const today = getTodayInTimezone(timezone);
  const sevenDaysAgo = getDateInTimezone(timezone, -6);

  // Fetch all data for the week
  const [daylogs, nutrition, expenses, customActivities, activeTemplates] = await Promise.all([
    DayLog.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    NutritionEntry.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    ExpenseEntry.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    CustomActivity.find({
      userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    ActivityTemplate.find({ userId, isActive: true }).select('name'),
  ]);

  // Filter custom activities to only include those with active templates
  const activeTemplateNames = new Set(activeTemplates.map((t) => t.name.toLowerCase()));
  const filteredCustomActivities = customActivities.filter((activity) =>
    activeTemplateNames.has(activity.name.toLowerCase())
  );

  // Group data by date
  const dailyData: Record<
    string,
    {
      date: string;
      sleep: number; // in hours
      exercise: number; // in minutes
      calories: number;
      expenses: number;
    }
  > = {};

  // Initialize all 7 days with zeros
  for (let i = 0; i < 7; i++) {
    const date = getDateInTimezone(timezone, -6 + i);
    dailyData[date] = {
      date,
      sleep: 0,
      exercise: 0,
      calories: 0,
      expenses: 0,
    };
  }

  // Fill in daylog data (sleep & exercise)
  daylogs.forEach((log) => {
    if (dailyData[log.date]) {
      if (log.sleep?.duration) {
        dailyData[log.date].sleep = Math.round((log.sleep.duration / 60) * 10) / 10; // Convert to hours
      }
      if (log.exercise?.duration) {
        dailyData[log.date].exercise = log.exercise.duration;
      }
    }
  });

  // Fill in nutrition data
  nutrition.forEach((entry) => {
    if (dailyData[entry.date]) {
      dailyData[entry.date].calories += entry.calories || 0;
    }
  });

  // Fill in expense data
  expenses.forEach((entry) => {
    if (dailyData[entry.date]) {
      dailyData[entry.date].expenses += entry.amount || 0;
    }
  });

  // Group custom activities by name and calculate totals
  const customActivitiesData: Record<
    string,
    { totalMinutes: number; count: number; dailyMinutes: Record<string, number> }
  > = {};

  filteredCustomActivities.forEach((activity) => {
    const activityName = activity.name.toLowerCase();
    if (!customActivitiesData[activityName]) {
      customActivitiesData[activityName] = { totalMinutes: 0, count: 0, dailyMinutes: {} };
    }

    let duration = 0;
    if (activity.duration) {
      duration = activity.duration;
    } else if (activity.startTime && activity.endTime) {
      const [startH, startM] = activity.startTime.split(':').map(Number);
      const [endH, endM] = activity.endTime.split(':').map(Number);
      duration = endH * 60 + endM - (startH * 60 + startM);
      if (duration < 0) duration = 0; // Handle invalid time ranges
    }

    if (duration > 0) {
      customActivitiesData[activityName].totalMinutes += duration;
      customActivitiesData[activityName].count++;

      if (!customActivitiesData[activityName].dailyMinutes[activity.date]) {
        customActivitiesData[activityName].dailyMinutes[activity.date] = 0;
      }
      customActivitiesData[activityName].dailyMinutes[activity.date] += duration;
    }
  });

  // Convert to array and calculate averages
  const data = Object.values(dailyData);
  const totals = data.reduce(
    (acc, day) => ({
      sleep: acc.sleep + day.sleep,
      exercise: acc.exercise + day.exercise,
      calories: acc.calories + day.calories,
      expenses: acc.expenses + day.expenses,
    }),
    { sleep: 0, exercise: 0, calories: 0, expenses: 0 }
  );

  const daysWithData = data.filter((d) => d.sleep > 0 || d.exercise > 0 || d.calories > 0).length;

  successResponse(
    res,
    {
      period: { start: sevenDaysAgo, end: today, days: 7 },
      dailyData: data,
      averages: {
        sleep: daysWithData > 0 ? Math.round((totals.sleep / daysWithData) * 10) / 10 : 0,
        exercise: daysWithData > 0 ? Math.round(totals.exercise / daysWithData) : 0,
        calories: daysWithData > 0 ? Math.round(totals.calories / daysWithData) : 0,
        expenses: Math.round((totals.expenses / 7) * 100) / 100,
      },
      totals: {
        sleep: Math.round(totals.sleep * 10) / 10,
        exercise: totals.exercise,
        calories: totals.calories,
        expenses: Math.round(totals.expenses * 100) / 100,
      },
      customActivities: Object.entries(customActivitiesData).map(([name, data]) => ({
        name,
        totalMinutes: data.totalMinutes,
        count: data.count,
        averageMinutes: data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0,
        dailyMinutes: data.dailyMinutes,
      })),
    },
    'Weekly trends fetched'
  );
});

/**
 * @desc    Get monthly trend data (last 30 days)
 * @route   GET /api/trends/monthly
 */
export const getMonthlyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  // Get user's timezone
  const user = await User.findById(userId).select('timezone');
  const timezone = user?.timezone || 'UTC';

  // Calculate date range (last 30 days including today)
  const today = getTodayInTimezone(timezone);
  const thirtyDaysAgo = getDateInTimezone(timezone, -29);

  // Fetch all data for the month
  const [daylogs, nutrition, expenses, customActivities, activeTemplates] = await Promise.all([
    DayLog.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    NutritionEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    ExpenseEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    CustomActivity.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: today },
    }).sort({ date: 1 }),
    ActivityTemplate.find({ userId, isActive: true }).select('name'),
  ]);

  // Filter custom activities to only include those with active templates
  const activeTemplateNames = new Set(activeTemplates.map((t) => t.name.toLowerCase()));
  const filteredCustomActivities = customActivities.filter((activity) =>
    activeTemplateNames.has(activity.name.toLowerCase())
  );

  // Group data by date (similar to weekly)
  const dailyData: Record<
    string,
    {
      date: string;
      sleep: number;
      exercise: number;
      calories: number;
      expenses: number;
    }
  > = {};

  // Initialize all 30 days
  for (let i = 0; i < 30; i++) {
    const date = getDateInTimezone(timezone, -29 + i);
    dailyData[date] = {
      date,
      sleep: 0,
      exercise: 0,
      calories: 0,
      expenses: 0,
    };
  }

  // Fill in data (same as weekly)
  daylogs.forEach((log) => {
    if (dailyData[log.date]) {
      if (log.sleep?.duration) {
        dailyData[log.date].sleep = Math.round((log.sleep.duration / 60) * 10) / 10;
      }
      if (log.exercise?.duration) {
        dailyData[log.date].exercise = log.exercise.duration;
      }
    }
  });

  nutrition.forEach((entry) => {
    if (dailyData[entry.date]) {
      dailyData[entry.date].calories += entry.calories || 0;
    }
  });

  expenses.forEach((entry) => {
    if (dailyData[entry.date]) {
      dailyData[entry.date].expenses += entry.amount || 0;
    }
  });

  // Calculate weekly breakdowns (4 weeks)
  const weeks: Array<{
    week: number;
    period: { start: string; end: string };
    averages: { sleep: number; exercise: number; calories: number; expenses: number };
  }> = [];

  for (let w = 0; w < 4; w++) {
    const weekStart = getDateInTimezone(timezone, -29 + w * 7);
    const weekEnd = getDateInTimezone(timezone, -29 + (w + 1) * 7 - 1);

    const weekData = Object.values(dailyData).filter(
      (d) => d.date >= weekStart && d.date <= weekEnd
    );

    const weekTotals = weekData.reduce(
      (acc, day) => ({
        sleep: acc.sleep + day.sleep,
        exercise: acc.exercise + day.exercise,
        calories: acc.calories + day.calories,
        expenses: acc.expenses + day.expenses,
      }),
      { sleep: 0, exercise: 0, calories: 0, expenses: 0 }
    );

    const weekDays = weekData.length;

    weeks.push({
      week: w + 1,
      period: { start: weekStart, end: weekEnd },
      averages: {
        sleep: weekDays > 0 ? Math.round((weekTotals.sleep / weekDays) * 10) / 10 : 0,
        exercise: weekDays > 0 ? Math.round(weekTotals.exercise / weekDays) : 0,
        calories: weekDays > 0 ? Math.round(weekTotals.calories / weekDays) : 0,
        expenses: weekDays > 0 ? Math.round((weekTotals.expenses / weekDays) * 100) / 100 : 0,
      },
    });
  }

  // Overall monthly stats
  const data = Object.values(dailyData);
  const totals = data.reduce(
    (acc, day) => ({
      sleep: acc.sleep + day.sleep,
      exercise: acc.exercise + day.exercise,
      calories: acc.calories + day.calories,
      expenses: acc.expenses + day.expenses,
    }),
    { sleep: 0, exercise: 0, calories: 0, expenses: 0 }
  );

  const daysWithData = data.filter((d) => d.sleep > 0 || d.exercise > 0 || d.calories > 0).length;

  // Group custom activities by name and calculate totals (for monthly)
  const customActivitiesData: Record<
    string,
    { totalMinutes: number; count: number; dailyMinutes: Record<string, number> }
  > = {};

  filteredCustomActivities.forEach((activity) => {
    const activityName = activity.name.toLowerCase();
    if (!customActivitiesData[activityName]) {
      customActivitiesData[activityName] = { totalMinutes: 0, count: 0, dailyMinutes: {} };
    }

    let duration = 0;
    if (activity.duration) {
      duration = activity.duration;
    } else if (activity.startTime && activity.endTime) {
      const [startH, startM] = activity.startTime.split(':').map(Number);
      const [endH, endM] = activity.endTime.split(':').map(Number);
      duration = endH * 60 + endM - (startH * 60 + startM);
      if (duration < 0) duration = 0; // Handle invalid time ranges
    }

    if (duration > 0) {
      customActivitiesData[activityName].totalMinutes += duration;
      customActivitiesData[activityName].count++;

      if (!customActivitiesData[activityName].dailyMinutes[activity.date]) {
        customActivitiesData[activityName].dailyMinutes[activity.date] = 0;
      }
      customActivitiesData[activityName].dailyMinutes[activity.date] += duration;
    }
  });

  successResponse(
    res,
    {
      period: { start: thirtyDaysAgo, end: today, days: 30 },
      dailyData: data,
      weeklyBreakdown: weeks,
      averages: {
        sleep: daysWithData > 0 ? Math.round((totals.sleep / daysWithData) * 10) / 10 : 0,
        exercise: daysWithData > 0 ? Math.round(totals.exercise / daysWithData) : 0,
        calories: daysWithData > 0 ? Math.round(totals.calories / daysWithData) : 0,
        expenses: Math.round((totals.expenses / 30) * 100) / 100,
      },
      totals: {
        sleep: Math.round(totals.sleep * 10) / 10,
        exercise: totals.exercise,
        calories: totals.calories,
        expenses: Math.round(totals.expenses * 100) / 100,
      },
      customActivities: Object.entries(customActivitiesData).map(([name, data]) => ({
        name,
        totalMinutes: data.totalMinutes,
        count: data.count,
        averageMinutes: data.count > 0 ? Math.round(data.totalMinutes / data.count) : 0,
        dailyMinutes: data.dailyMinutes,
      })),
    },
    'Monthly trends fetched'
  );
});

/**
 * @desc    Get comparison stats (today vs yesterday, this week vs last week)
 * @route   GET /api/trends/comparison
 */
export const getComparison = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  // Get user's timezone
  const user = await User.findById(userId).select('timezone');
  const timezone = user?.timezone || 'UTC';

  const today = getTodayInTimezone(timezone);
  const yesterday = getDateInTimezone(timezone, -1);

  // Fetch today and yesterday data
  const [
    todayLog,
    yesterdayLog,
    todayNutrition,
    yesterdayNutrition,
    todayExpenses,
    yesterdayExpenses,
  ] = await Promise.all([
    DayLog.findOne({ userId, date: today }),
    DayLog.findOne({ userId, date: yesterday }),
    NutritionEntry.find({ userId, date: today }),
    NutritionEntry.find({ userId, date: yesterday }),
    ExpenseEntry.find({ userId, date: today }),
    ExpenseEntry.find({ userId, date: yesterday }),
  ]);

  // Calculate daily comparison
  const todayData = {
    sleep: todayLog?.sleep?.duration ? Math.round((todayLog.sleep.duration / 60) * 10) / 10 : 0,
    exercise: todayLog?.exercise?.duration || 0,
    calories: todayNutrition.reduce((sum, e) => sum + (e.calories || 0), 0),
    expenses: Math.round(todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) * 100) / 100,
  };

  const yesterdayData = {
    sleep: yesterdayLog?.sleep?.duration
      ? Math.round((yesterdayLog.sleep.duration / 60) * 10) / 10
      : 0,
    exercise: yesterdayLog?.exercise?.duration || 0,
    calories: yesterdayNutrition.reduce((sum, e) => sum + (e.calories || 0), 0),
    expenses:
      Math.round(yesterdayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) * 100) / 100,
  };

  const dailyComparison = {
    sleep: {
      today: todayData.sleep,
      yesterday: yesterdayData.sleep,
      change: Math.round((todayData.sleep - yesterdayData.sleep) * 10) / 10,
      changePercent:
        yesterdayData.sleep > 0
          ? Math.round(((todayData.sleep - yesterdayData.sleep) / yesterdayData.sleep) * 100)
          : 0,
    },
    exercise: {
      today: todayData.exercise,
      yesterday: yesterdayData.exercise,
      change: todayData.exercise - yesterdayData.exercise,
      changePercent:
        yesterdayData.exercise > 0
          ? Math.round(
              ((todayData.exercise - yesterdayData.exercise) / yesterdayData.exercise) * 100
            )
          : 0,
    },
    calories: {
      today: todayData.calories,
      yesterday: yesterdayData.calories,
      change: todayData.calories - yesterdayData.calories,
      changePercent:
        yesterdayData.calories > 0
          ? Math.round(
              ((todayData.calories - yesterdayData.calories) / yesterdayData.calories) * 100
            )
          : 0,
    },
    expenses: {
      today: todayData.expenses,
      yesterday: yesterdayData.expenses,
      change: Math.round((todayData.expenses - yesterdayData.expenses) * 100) / 100,
      changePercent:
        yesterdayData.expenses > 0
          ? Math.round(
              ((todayData.expenses - yesterdayData.expenses) / yesterdayData.expenses) * 100
            )
          : 0,
    },
  };

  successResponse(
    res,
    {
      daily: dailyComparison,
      dates: {
        today,
        yesterday,
      },
    },
    'Comparison data fetched'
  );
});

/**
 * @desc    Get yearly trend data (last 12 months)
 * @route   GET /api/trends/yearly
 */
export const getYearlyTrends = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  // Get user's timezone
  const user = await User.findById(userId).select('timezone');
  const timezone = user?.timezone || 'UTC';

  // Calculate date range (last 12 months including current month)
  const today = getTodayInTimezone(timezone);
  const oneYearAgo = getDateInTimezone(timezone, -365);

  // Fetch all data for the year
  const [daylogs, nutrition, expenses, customActivities, activeTemplates] = await Promise.all([
    DayLog.find({
      userId,
      date: { $gte: oneYearAgo, $lte: today },
    }).sort({ date: 1 }),
    NutritionEntry.find({
      userId,
      date: { $gte: oneYearAgo, $lte: today },
    }).sort({ date: 1 }),
    ExpenseEntry.find({
      userId,
      date: { $gte: oneYearAgo, $lte: today },
    }).sort({ date: 1 }),
    CustomActivity.find({
      userId,
      date: { $gte: oneYearAgo, $lte: today },
    }).sort({ date: 1 }),
    ActivityTemplate.find({ userId, isActive: true }).select('name'),
  ]);

  // Filter custom activities to only include those with active templates
  const activeTemplateNames = new Set(activeTemplates.map((t) => t.name.toLowerCase()));
  const filteredCustomActivities = customActivities.filter((activity) =>
    activeTemplateNames.has(activity.name.toLowerCase())
  );

  // Group data by month
  const monthlyData: Record<
    string,
    {
      month: string;
      year: number;
      monthName: string;
      sleep: number[];
      exercise: number[];
      calories: number[];
      expenses: number[];
    }
  > = {};

  // Initialize last 12 months
  const months: string[] = [];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Get current date in user's timezone
  const nowInTimezone = new Date(today + 'T00:00:00Z');

  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(nowInTimezone);
    targetDate.setMonth(targetDate.getMonth() - i);
    const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

    monthlyData[monthKey] = {
      month: monthKey,
      year: targetDate.getFullYear(),
      monthName: monthNames[targetDate.getMonth()],
      sleep: [],
      exercise: [],
      calories: [],
      expenses: [],
    };
    months.push(monthKey);
  }

  // Process daylog data
  daylogs.forEach((log) => {
    const logDate = new Date(log.date);
    const monthKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;

    if (monthlyData[monthKey]) {
      if (log.sleep?.duration) {
        monthlyData[monthKey].sleep.push(Math.round((log.sleep.duration / 60) * 10) / 10);
      }
      if (log.exercise?.duration) {
        monthlyData[monthKey].exercise.push(log.exercise.duration);
      }
    }
  });

  // Process nutrition data
  nutrition.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

    if (monthlyData[monthKey]) {
      monthlyData[monthKey].calories.push(entry.calories || 0);
    }
  });

  // Process expense data
  expenses.forEach((entry) => {
    const entryDate = new Date(entry.date);
    const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;

    if (monthlyData[monthKey]) {
      monthlyData[monthKey].expenses.push(entry.amount || 0);
    }
  });

  // Process custom activities data - group by activity name
  const customActivitiesByName: Record<string, { monthlyMinutes: Record<string, number[]> }> = {};

  filteredCustomActivities.forEach((activity) => {
    const activityName = activity.name.toLowerCase();
    const activityDate = new Date(activity.date);
    const monthKey = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}`;

    if (!customActivitiesByName[activityName]) {
      customActivitiesByName[activityName] = { monthlyMinutes: {} };
    }

    if (!customActivitiesByName[activityName].monthlyMinutes[monthKey]) {
      customActivitiesByName[activityName].monthlyMinutes[monthKey] = [];
    }

    let duration = 0;
    if (activity.duration) {
      duration = activity.duration;
    } else if (activity.startTime && activity.endTime) {
      const [startH, startM] = activity.startTime.split(':').map(Number);
      const [endH, endM] = activity.endTime.split(':').map(Number);
      duration = endH * 60 + endM - (startH * 60 + startM);
      // Handle negative duration (midnight crossing)
      if (duration < 0) {
        duration = 0;
      }
    }

    if (duration > 0) {
      customActivitiesByName[activityName].monthlyMinutes[monthKey].push(duration);
    }
  });

  // Calculate monthly averages and totals
  const monthlyAverages = months.map((monthKey) => {
    const data = monthlyData[monthKey];

    const sleepAvg =
      data.sleep.length > 0
        ? Math.round((data.sleep.reduce((a, b) => a + b, 0) / data.sleep.length) * 10) / 10
        : 0;

    const exerciseAvg =
      data.exercise.length > 0
        ? Math.round(data.exercise.reduce((a, b) => a + b, 0) / data.exercise.length)
        : 0;

    const caloriesAvg =
      data.calories.length > 0
        ? Math.round(data.calories.reduce((a, b) => a + b, 0) / data.calories.length)
        : 0;

    const expensesTotal =
      data.expenses.length > 0
        ? Math.round(data.expenses.reduce((a, b) => a + b, 0) * 100) / 100
        : 0;

    return {
      month: data.monthName,
      fullMonth: monthKey,
      year: data.year,
      averages: {
        sleep: sleepAvg,
        exercise: exerciseAvg,
        calories: caloriesAvg,
      },
      totals: {
        expenses: expensesTotal,
      },
      daysWithData: Math.max(
        data.sleep.length,
        data.exercise.length,
        data.calories.length,
        data.expenses.length
      ),
    };
  });

  // Calculate overall yearly stats
  const yearTotals = {
    sleep: 0,
    sleepDays: 0,
    exercise: 0,
    exerciseDays: 0,
    calories: 0,
    caloriesDays: 0,
    expenses: 0,
  };

  Object.values(monthlyData).forEach((month) => {
    if (month.sleep.length > 0) {
      yearTotals.sleep += month.sleep.reduce((a, b) => a + b, 0);
      yearTotals.sleepDays += month.sleep.length;
    }
    if (month.exercise.length > 0) {
      yearTotals.exercise += month.exercise.reduce((a, b) => a + b, 0);
      yearTotals.exerciseDays += month.exercise.length;
    }
    if (month.calories.length > 0) {
      yearTotals.calories += month.calories.reduce((a, b) => a + b, 0);
      yearTotals.caloriesDays += month.calories.length;
    }
    if (month.expenses.length > 0) {
      yearTotals.expenses += month.expenses.reduce((a, b) => a + b, 0);
    }
  });

  successResponse(
    res,
    {
      period: { start: oneYearAgo, end: today, months: 12 },
      monthlyData: monthlyAverages,
      yearlyAverages: {
        sleep:
          yearTotals.sleepDays > 0
            ? Math.round((yearTotals.sleep / yearTotals.sleepDays) * 10) / 10
            : 0,
        exercise:
          yearTotals.exerciseDays > 0
            ? Math.round(yearTotals.exercise / yearTotals.exerciseDays)
            : 0,
        calories:
          yearTotals.caloriesDays > 0
            ? Math.round(yearTotals.calories / yearTotals.caloriesDays)
            : 0,
        expenses: Math.round((yearTotals.expenses / 12) * 100) / 100,
      },
      yearlyTotals: {
        sleep: Math.round(yearTotals.sleep * 10) / 10,
        exercise: yearTotals.exercise,
        calories: yearTotals.calories,
        expenses: Math.round(yearTotals.expenses * 100) / 100,
      },
      customActivities: Object.entries(customActivitiesByName).map(([name, data]) => {
        // Calculate monthly averages for this activity
        const monthlyAverages = months.map((monthKey) => {
          const monthMinutes = data.monthlyMinutes[monthKey] || [];
          const avgMinutes =
            monthMinutes.length > 0
              ? Math.round(monthMinutes.reduce((a, b) => a + b, 0) / monthMinutes.length)
              : 0;
          return { month: monthKey, averageMinutes: avgMinutes, count: monthMinutes.length };
        });

        // Calculate yearly totals for this activity
        const yearlyTotal = Object.values(data.monthlyMinutes)
          .flat()
          .reduce((a, b) => a + b, 0);
        const yearlyCount = Object.values(data.monthlyMinutes).flat().length;

        return {
          name,
          monthlyAverages,
          yearlyTotal: Math.round(yearlyTotal),
          yearlyCount,
          yearlyAverage: yearlyCount > 0 ? Math.round(yearlyTotal / yearlyCount) : 0,
        };
      }),
    },
    'Yearly trends fetched'
  );
});
