/**
 * Calendar Page Types
 * Types and interfaces for the calendar view and day tracking
 */

export type CompletionStatus = 'complete' | 'partial' | 'empty' | 'future';

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  completionStatus: CompletionStatus;
  hasSleep: boolean;
  hasExercise: boolean;
  mealCount: number;
  customActivityCount: number;
  expenseCount: number;
  notes?: string;
}

export interface MonthStats {
  totalDays: number;
  completeDays: number;
  partialDays: number;
  emptyDays: number;
  avgSleepHours: number;
  totalExerciseMinutes: number;
  totalExpenses: number;
  daysWithData: number;
}

export interface CalendarMonthData {
  month: string; // YYYY-MM
  year: number;
  monthIndex: number; // 0-11
  days: (CalendarDayData | null)[]; // Array of 42 items (6 weeks)
  stats: MonthStats;
}

export interface DayDetailData {
  date: string;
  daylog?: {
    sleep?: {
      duration?: number;
      startTime?: string;
      endTime?: string;
    };
    exercise?: {
      type?: string;
      duration?: number;
      startTime?: string;
      endTime?: string;
    };
    notes?: string;
  };
  meals: Array<{
    _id: string;
    mealType: string;
    foodName: string;
    calories: number;
  }>;
  customActivities: Array<{
    _id: string;
    name: string;
    duration: number;
    notes?: string;
  }>;
  expenses: Array<{
    _id: string;
    amount: number;
    description: string;
    category?: string;
  }>;
}
