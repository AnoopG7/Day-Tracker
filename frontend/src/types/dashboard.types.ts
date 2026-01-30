/** Dashboard data types matching backend response */

export interface DayLog {
  _id: string;
  userId: string;
  date: string;
  sleep?: {
    duration?: number; // minutes
    startTime?: string;
    endTime?: string;
  };
  exercise?: {
    duration?: number; // minutes
    startTime?: string;
    endTime?: string;
    exerciseType?: string;
    notes?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomActivity {
  _id: string;
  userId: string;
  date: string;
  name: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionEntry {
  _id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseEntry {
  _id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'bank-transfer' | 'other';
  merchant?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  byMealType: Record<string, { count: number; calories: number }>;
}

export interface ExpenseTotals {
  total: number;
  byCategory: Record<string, { count: number; amount: number }>;
}

export interface DashboardData {
  date: string;
  daylog: DayLog | null;
  activities: {
    items: CustomActivity[];
    count: number;
    totalMinutes: number;
    uniqueTypes?: number; // Add for frontend display (calculated from items)
  };
  nutrition: {
    entries: NutritionEntry[];
    count: number;
    totals: NutritionTotals;
  };
  expenses: {
    entries: ExpenseEntry[];
    count: number;
    totals: ExpenseTotals;
  };
  customActivities?: {
    templates: string[]; // For Phase 1-3: unique activity names
    todayLogs: CustomActivity[];
  };
}
