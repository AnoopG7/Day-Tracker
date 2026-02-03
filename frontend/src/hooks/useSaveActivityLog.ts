import { useState, useCallback } from 'react';
import api from '@services/api';
import type { MealRow } from '@components/dashboard/MealTable';
import type { ExpenseRow } from '@components/dashboard/ExpenseTable';
import type { DashboardData } from '@/types/dashboard.types';

interface ActivityData {
  duration: string;
  notes: string;
}

interface SleepExerciseData {
  sleepHours: string;
  sleepStartTime: string;
  sleepEndTime: string;
  exerciseDuration: string;
  exerciseType: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  daylogNotes: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

interface UseSaveActivityLogReturn {
  submitting: boolean;
  snackbar: SnackbarState;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
  handleSaveAll: () => Promise<void>;
}

// ===== Helper Functions =====

const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return '';
  const [time, modifier] = time12h.split(' ');
  let [hours] = time.split(':');
  const minutes = time.split(':')[1];
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
};

// ===== Save Functions =====

async function saveDaylog(selectedDate: string, sleepData: SleepExerciseData): Promise<void> {
  const {
    sleepStartTime,
    sleepEndTime,
    sleepHours,
    exerciseStartTime,
    exerciseEndTime,
    exerciseDuration,
    exerciseType,
    daylogNotes,
  } = sleepData;

  if (!sleepStartTime && !exerciseStartTime && !exerciseDuration && !exerciseType && !daylogNotes) {
    return;
  }

  const daylogPayload: {
    date: string;
    sleep?: { startTime?: string; endTime?: string; duration?: number };
    exercise?: { startTime?: string; endTime?: string; duration?: number; exerciseType?: string };
    notes?: string;
  } = { date: selectedDate };

  if (sleepStartTime && sleepEndTime) {
    daylogPayload.sleep = {
      startTime: convertTo24Hour(sleepStartTime),
      endTime: convertTo24Hour(sleepEndTime),
      ...(sleepHours && { duration: Math.round(Number(sleepHours) * 60) }),
    };
  }

  if (exerciseStartTime && exerciseEndTime) {
    daylogPayload.exercise = {
      startTime: convertTo24Hour(exerciseStartTime),
      endTime: convertTo24Hour(exerciseEndTime),
      ...(exerciseDuration && { duration: Number(exerciseDuration) }),
      ...(exerciseType && { exerciseType: exerciseType.toLowerCase() }),
    };
  } else if (exerciseDuration || exerciseType) {
    daylogPayload.exercise = {
      ...(exerciseDuration && { duration: Number(exerciseDuration) }),
      ...(exerciseType && { exerciseType: exerciseType.toLowerCase() }),
    };
  }

  if (daylogNotes) {
    daylogPayload.notes = daylogNotes;
  }

  await api.post('/daylogs', daylogPayload);
}

async function saveMeals(selectedDate: string, mealRows: MealRow[]): Promise<void> {
  for (const meal of mealRows) {
    if (meal.foodName && meal.calories && meal.mealType) {
      let mealTypeValue = meal.mealType.toLowerCase();
      if (mealTypeValue === 'snacks') mealTypeValue = 'snack';

      try {
        await api.post('/nutrition', {
          date: selectedDate,
          mealType: mealTypeValue,
          foodName: meal.foodName.toLowerCase(),
          calories: Number(meal.calories),
          ...(meal.protein && { protein: Number(meal.protein) }),
          ...(meal.carbs && { carbs: Number(meal.carbs) }),
          ...(meal.fats && { fats: Number(meal.fats) }),
          ...(meal.fiber && { fiber: Number(meal.fiber) }),
          ...(meal.notes && { notes: meal.notes }),
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown }; message?: string };
        console.error('Failed to save meal:', meal.foodName, err.response?.data || err.message);
        throw new Error(
          `Failed to save meal: ${meal.foodName}. ${typeof err.response?.data === 'object' && err.response.data && 'message' in err.response.data ? err.response.data.message : err.message}`
        );
      }
    }
  }
}

async function saveExpenses(selectedDate: string, expenseRows: ExpenseRow[]): Promise<void> {
  const validCategories = [
    'food',
    'transport',
    'shopping',
    'bills',
    'entertainment',
    'health',
    'other',
  ];
  const validPayments = ['cash', 'card', 'upi', 'netbanking', 'other'];

  for (const expense of expenseRows) {
    if (expense.amount && expense.description && expense.category) {
      const categoryValue = expense.category.toLowerCase();
      let paymentValue = expense.paymentMethod ? expense.paymentMethod.toLowerCase() : undefined;
      if (paymentValue === 'net banking') paymentValue = 'netbanking';

      if (!validCategories.includes(categoryValue)) {
        throw new Error(
          `Invalid category "${expense.category}". Must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, or Other`
        );
      }

      if (paymentValue && !validPayments.includes(paymentValue)) {
        throw new Error(
          `Invalid payment method "${expense.paymentMethod}". Must be one of: Cash, Card, UPI, Net Banking, or Other`
        );
      }

      try {
        await api.post('/expenses', {
          date: selectedDate,
          amount: Number(expense.amount),
          category: categoryValue,
          description: expense.description,
          ...(paymentValue && { paymentMethod: paymentValue }),
          ...(expense.merchant && { merchant: expense.merchant.toLowerCase() }),
          ...(expense.notes && { notes: expense.notes }),
        });
      } catch (error: unknown) {
        const err = error as { response?: { data?: unknown }; message?: string };
        console.error(
          'Failed to save expense:',
          expense.description,
          err.response?.data || err.message
        );
        throw new Error(
          `Failed to save expense: ${expense.description}. ${typeof err.response?.data === 'object' && err.response.data && 'message' in err.response.data ? err.response.data.message : err.message}`
        );
      }
    }
  }
}

async function saveCustomActivities(
  selectedDate: string,
  customActivities: Record<string, ActivityData>,
  data: DashboardData | null
): Promise<void> {
  if (!data?.customActivities?.templates) return;

  for (const activityName of data.customActivities.templates) {
    const activityData = customActivities[activityName];
    const existingLog = data.customActivities.todayLogs.find((log) => log.name === activityName);

    // If no duration or duration is 0, delete the activity if it exists
    if (!activityData?.duration || activityData.duration === '0' || activityData.duration === '') {
      if (existingLog?._id) {
        try {
          await api.delete(`/activities/${existingLog._id}`);
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } }; message?: string };
          console.error(
            'Failed to delete activity:',
            activityName,
            err.response?.data || err.message
          );
        }
      }
      continue;
    }

    // Upsert activity
    try {
      await api.put('/activities/upsert', {
        date: selectedDate,
        name: activityName,
        duration: Number(activityData.duration),
        ...(activityData.notes && { notes: activityData.notes }),
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error(
        'Failed to save custom activity:',
        activityName,
        err.response?.data || err.message
      );
      throw new Error(
        `Failed to save activity "${activityName}": ${err.response?.data?.message || err.message}`
      );
    }
  }
}

// ===== Validation =====

function validateMeals(mealRows: MealRow[]): string[] | null {
  const incompleteMeals = mealRows.filter((meal) => {
    const hasAnyData = meal.mealType || meal.foodName || meal.calories;
    const hasAllRequired = meal.mealType && meal.foodName && meal.calories;
    return hasAnyData && !hasAllRequired;
  });

  if (incompleteMeals.length === 0) return null;

  const missingFields: string[] = [];
  incompleteMeals.forEach((meal) => {
    if (!meal.mealType) missingFields.push('Meal Type');
    if (!meal.foodName) missingFields.push('Food Name');
    if (!meal.calories) missingFields.push('Calories');
  });
  return [...new Set(missingFields)];
}

// ===== Main Hook =====

export function useSaveActivityLog(
  selectedDate: string,
  sleepExerciseData: SleepExerciseData,
  mealRows: MealRow[],
  expenseRows: ExpenseRow[],
  customActivities: Record<string, ActivityData>,
  data: DashboardData | null,
  onSuccess?: (date?: string) => void
): UseSaveActivityLogReturn {
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSaveAll = useCallback(async (): Promise<void> => {
    if (submitting) return;

    // Validate meals
    const missingFields = validateMeals(mealRows);
    if (missingFields) {
      setSnackbar({
        open: true,
        message: `Please fill in all required meal fields: ${missingFields.join(', ')}`,
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Bulk delete existing entries
      await Promise.all([
        api.delete(`/nutrition/date/${selectedDate}`),
        api.delete(`/expenses/date/${selectedDate}`),
      ]);

      // Save all data
      await saveDaylog(selectedDate, sleepExerciseData);
      await saveMeals(selectedDate, mealRows);
      await saveExpenses(selectedDate, expenseRows);
      await saveCustomActivities(selectedDate, customActivities, data);

      // Refetch
      await onSuccess?.(selectedDate);

      setSnackbar({ open: true, message: 'Changes saved successfully! ✓', severity: 'success' });
    } catch (err) {
      console.error('Failed to save activities:', err);
      const error = err as { message?: string };
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save changes. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    selectedDate,
    sleepExerciseData,
    mealRows,
    expenseRows,
    customActivities,
    data,
    onSuccess,
  ]);

  return { submitting, snackbar, setSnackbar, handleSaveAll };
}

export default useSaveActivityLog;
