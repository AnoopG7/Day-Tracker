import { useState, useEffect, useMemo } from 'react';
import type { MealRow } from '@components/dashboard/MealTable';
import type { DashboardData } from '@/types/dashboard.types';

// Helper to capitalize first letter
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

interface UseMealDataReturn {
  mealRows: MealRow[];
  setMealRows: React.Dispatch<React.SetStateAction<MealRow[]>>;
  addMealRow: () => void;
  removeMealRow: (id: string) => void;
  updateMealRow: (id: string, field: keyof MealRow, value: string) => void;
}

const emptyMealRow: MealRow = {
  id: '1',
  mealType: '',
  foodName: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  fiber: '',
  notes: '',
};

export function useMealData(data: DashboardData | null, selectedDate: string): UseMealDataReturn {
  // Calculate initial rows from data
  const initialRows = useMemo(() => {
    if (data?.nutrition?.entries && data.nutrition.entries.length > 0) {
      return data.nutrition.entries.map(
        (e): MealRow => ({
          id: e._id,
          mealType: e.mealType === 'snack' ? 'Snacks' : capitalize(e.mealType),
          foodName: e.foodName,
          calories: e.calories?.toString() || '',
          protein: e.protein?.toString() || '',
          carbs: e.carbs?.toString() || '',
          fats: e.fats?.toString() || '',
          fiber: e.fiber?.toString() || '',
          notes: e.notes || '',
        })
      );
    }
    return [emptyMealRow];
  }, [data, selectedDate]);

  const [mealRows, setMealRows] = useState<MealRow[]>(initialRows);

  // Update rows when data changes
  useEffect(() => {
    setMealRows(initialRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.nutrition?.entries, selectedDate]);

  const addMealRow = () => {
    const newRow: MealRow = {
      id: Date.now().toString(),
      mealType: '',
      foodName: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      fiber: '',
      notes: '',
    };
    setMealRows([...mealRows, newRow]);
  };

  const removeMealRow = (id: string) => {
    if (mealRows.length > 1) {
      setMealRows(mealRows.filter((row) => row.id !== id));
    }
  };

  const updateMealRow = (id: string, field: keyof MealRow, value: string) => {
    setMealRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return {
    mealRows,
    setMealRows,
    addMealRow,
    removeMealRow,
    updateMealRow,
  };
}
