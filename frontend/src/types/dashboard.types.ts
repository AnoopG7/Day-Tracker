/** Dashboard data types matching backend response */

export interface DayLog {
  _id: string;
  userId: string;
  date: string;
  sleep?: {
    hours: number;
    quality?: 'poor' | 'fair' | 'good' | 'excellent';
  };
  exercise?: {
    type: string;
    duration: number;
    intensity?: 'low' | 'medium' | 'high';
  };
  mood?: 'terrible' | 'bad' | 'okay' | 'good' | 'great';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomActivity {
  _id: string;
  userId: string;
  date: string;
  activityName: string;
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
  foodItem: string;
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
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank-transfer' | 'other';
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
}
