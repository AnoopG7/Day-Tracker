import api from './api';
import type { CalendarDayData, MonthStats } from '@/types/calendar.types';

/**
 * Get calendar data for a specific month
 */
export const getMonthCalendarData = async (
  year: number,
  month: number // 0-11
): Promise<{ days: Map<string, CalendarDayData>; stats: MonthStats }> => {
  // Calculate date range for the month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Fetch all data in parallel
  const [daylogsRes, activitiesRes, nutritionRes, expensesRes] = await Promise.all([
    api.get(`/daylogs?startDate=${startDate}&endDate=${endDate}`),
    api.get(`/activities?startDate=${startDate}&endDate=${endDate}`),
    api.get(`/nutrition?startDate=${startDate}&endDate=${endDate}`),
    api.get(`/expenses?startDate=${startDate}&endDate=${endDate}`),
  ]);

  // Extract data from wrapped API responses {success, message, data}
  const daylogs = daylogsRes.data.data?.daylogs || [];
  const activities = activitiesRes.data.data?.activities || [];
  const nutrition = nutritionRes.data.data?.entries || []; // Backend returns 'entries'
  const expenses = expensesRes.data.data?.expenses || [];

  // Create a map of date -> data
  const dayDataMap = new Map<string, CalendarDayData>();

  // Process daylogs
  for (const daylog of daylogs) {
    const date = daylog.date;
    const hasSleep = !!(
      daylog.sleep?.duration ||
      (daylog.sleep?.startTime && daylog.sleep?.endTime)
    );
    const hasExercise = !!(
      daylog.exercise?.duration ||
      (daylog.exercise?.startTime && daylog.exercise?.endTime)
    );

    dayDataMap.set(date, {
      date,
      completionStatus: 'empty', // Will calculate later
      hasSleep,
      hasExercise,
      mealCount: 0,
      customActivityCount: 0,
      expenseCount: 0,
      notes: daylog.notes,
    });
  }

  // Process nutrition (meals)
  for (const meal of nutrition) {
    // Extract date from ISO string (meal.date might be "2026-01-30T00:00:00.000Z")
    const date = meal.date.split('T')[0];

    const existing = dayDataMap.get(date) || {
      date,
      completionStatus: 'empty',
      hasSleep: false,
      hasExercise: false,
      mealCount: 0,
      customActivityCount: 0,
      expenseCount: 0,
    };
    existing.mealCount += 1;
    dayDataMap.set(date, existing);
  }

  // Process custom activities
  for (const activity of activities) {
    const date = activity.date;
    const existing = dayDataMap.get(date) || {
      date,
      completionStatus: 'empty',
      hasSleep: false,
      hasExercise: false,
      mealCount: 0,
      customActivityCount: 0,
      expenseCount: 0,
    };
    existing.customActivityCount += 1;
    dayDataMap.set(date, existing);
  }

  // Process expenses
  for (const expense of expenses) {
    const date = expense.date;
    const existing = dayDataMap.get(date) || {
      date,
      completionStatus: 'empty',
      hasSleep: false,
      hasExercise: false,
      mealCount: 0,
      customActivityCount: 0,
      expenseCount: 0,
    };
    existing.expenseCount += 1;
    dayDataMap.set(date, existing);
  }

  // Calculate completion status and stats
  let completeDays = 0;
  let partialDays = 0;
  let emptyDays = 0;
  let totalSleepMinutes = 0;
  let sleepDayCount = 0;
  let totalExerciseMinutes = 0;
  let totalExpenseAmount = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const [date, data] of dayDataMap.entries()) {
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);

    // Skip future dates for completion calculation
    if (dayDate > today) {
      data.completionStatus = 'future';
      continue;
    }

    // Calculate completion status
    const criteria = [data.hasSleep, data.hasExercise, data.mealCount >= 2];
    const completedCount = criteria.filter(Boolean).length;

    if (completedCount === 3) {
      data.completionStatus = 'complete';
      completeDays++;
    } else if (completedCount > 0) {
      data.completionStatus = 'partial';
      partialDays++;
    } else {
      data.completionStatus = 'empty';
      emptyDays++;
    }

    dayDataMap.set(date, data);
  }

  // Calculate sleep/exercise stats from daylogs
  for (const daylog of daylogs) {
    if (daylog.sleep?.duration) {
      totalSleepMinutes += daylog.sleep.duration;
      sleepDayCount++;
    } else if (daylog.sleep?.startTime && daylog.sleep?.endTime) {
      const [startH, startM] = daylog.sleep.startTime.split(':').map(Number);
      const [endH, endM] = daylog.sleep.endTime.split(':').map(Number);
      let duration = endH * 60 + endM - (startH * 60 + startM);
      if (duration < 0) duration += 24 * 60;
      totalSleepMinutes += duration;
      sleepDayCount++;
    }

    if (daylog.exercise?.duration) {
      totalExerciseMinutes += daylog.exercise.duration;
    } else if (daylog.exercise?.startTime && daylog.exercise?.endTime) {
      const [startH, startM] = daylog.exercise.startTime.split(':').map(Number);
      const [endH, endM] = daylog.exercise.endTime.split(':').map(Number);
      const duration = endH * 60 + endM - (startH * 60 + startM);
      totalExerciseMinutes += Math.max(0, duration);
    }
  }

  // Calculate expense total
  for (const expense of expenses) {
    totalExpenseAmount += expense.amount || 0;
  }

  const stats: MonthStats = {
    totalDays: lastDay,
    completeDays,
    partialDays,
    emptyDays,
    avgSleepHours: sleepDayCount > 0 ? totalSleepMinutes / sleepDayCount / 60 : 0,
    totalExerciseMinutes,
    totalExpenses: totalExpenseAmount,
    daysWithData: dayDataMap.size,
  };

  return { days: dayDataMap, stats };
};
