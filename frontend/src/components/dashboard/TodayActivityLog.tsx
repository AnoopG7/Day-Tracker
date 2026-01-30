import { type FC, useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider, TextField, Snackbar, Alert } from '@mui/material';

// Helper to capitalize first letter
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
import api from '@services/api';
import type { DashboardData } from '@/types/dashboard.types';
import { SleepExerciseForm } from './SleepExerciseForm';
import { MealsSection } from './MealsSection';
import { ExpenseTable } from './ExpenseTable';
import { CustomActivityForm } from './CustomActivityForm';
import { useMealData } from '@hooks/useMealData';
import { useExpenseData } from '@hooks/useExpenseData';

interface TodayActivityLogProps {
  selectedDate: string;
  data: DashboardData | null;
  onSuccess?: (date?: string) => void;
}

/**
 * Today's Activity Log - Modular Excel-like interface for daily tracking
 */
export const TodayActivityLog: FC<TodayActivityLogProps> = ({ selectedDate, data, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sleep & Exercise state
  const [sleepHours, setSleepHours] = useState('');
  const [sleepStartTime, setSleepStartTime] = useState('');
  const [sleepEndTime, setSleepEndTime] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseStartTime, setExerciseStartTime] = useState('');
  const [exerciseEndTime, setExerciseEndTime] = useState('');
  const [daylogNotes, setDaylogNotes] = useState('');

  // Custom hooks for meal and expense data
  const mealData = useMealData(data, selectedDate);
  const expenseData = useExpenseData(data, selectedDate);

  // Custom activities state
  const [customActivities, setCustomActivities] = useState<
    Record<string, { duration: string; notes: string }>
  >({});

  // Initialize custom activities when data loads
  useEffect(() => {
    if (data?.customActivities) {
      const initialData: Record<string, { duration: string; notes: string }> = {};
      data.customActivities.templates.forEach((name) => {
        const todayLog = data.customActivities!.todayLogs.find((log) => log.name === name);
        initialData[name] = {
          duration: todayLog?.duration?.toString() || '',
          notes: todayLog?.notes || '',
        };
      });
      setCustomActivities(initialData);
    }
  }, [data]);

  // Pre-fill sleep & exercise when data loads
  useEffect(() => {
    if (data?.daylog) {
      setSleepHours(
        data.daylog.sleep?.duration ? (data.daylog.sleep.duration / 60).toString() : ''
      );
      setSleepStartTime(data.daylog.sleep?.startTime || '');
      setSleepEndTime(data.daylog.sleep?.endTime || '');
      setExerciseDuration(data.daylog.exercise?.duration?.toString() || '');
      setExerciseStartTime(data.daylog.exercise?.startTime || '');
      setExerciseEndTime(data.daylog.exercise?.endTime || '');
      setExerciseType(
        data.daylog.exercise?.exerciseType ? capitalize(data.daylog.exercise.exerciseType) : ''
      );
      setDaylogNotes(data.daylog.notes || '');
    } else {
      // Reset when no data (new date or cleared data)
      setSleepHours('');
      setSleepStartTime('');
      setSleepEndTime('');
      setExerciseDuration('');
      setExerciseStartTime('');
      setExerciseEndTime('');
      setExerciseType('');
      setDaylogNotes('');
    }
  }, [data, selectedDate]);

  // Custom activity handler
  const handleUpdateActivity = (
    activityName: string,
    field: 'duration' | 'notes',
    value: string
  ) => {
    setCustomActivities((prev) => ({
      ...prev,
      [activityName]: {
        ...prev[activityName],
        [field]: value,
      },
    }));
  };

  // Save all data
  const handleSaveAll = async (): Promise<void> => {
    if (submitting) return;

    setSubmitting(true);
    try {
      // Bulk delete existing entries for this date (2 API calls instead of many)
      await Promise.all([
        api.delete(`/nutrition/date/${selectedDate}`),
        api.delete(`/expenses/date/${selectedDate}`),
      ]);

      // Helper to convert 12-hour time to 24-hour format
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

      // Save sleep & exercise
      if (sleepStartTime || exerciseStartTime || daylogNotes) {
        const daylogPayload: {
          date: string;
          sleep?: { startTime?: string; endTime?: string; duration?: number };
          exercise?: {
            startTime?: string;
            endTime?: string;
            duration?: number;
            exerciseType?: string;
          };
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
        }
        if (daylogNotes) {
          daylogPayload.notes = daylogNotes;
        }

        await api.post('/daylogs', daylogPayload);
      }

      // Save all meals
      for (const meal of mealData.mealRows) {
        if (meal.foodName && meal.calories && meal.mealType) {
          // Map display values to backend enum values
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

      // Save expenses
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

      for (const expense of expenseData.expenseRows) {
        if (expense.amount && expense.description && expense.category) {
          // Map display values to backend enum values
          const categoryValue = expense.category.toLowerCase();
          let paymentValue = expense.paymentMethod
            ? expense.paymentMethod.toLowerCase()
            : undefined;

          // Handle multi-word payment methods
          if (paymentValue === 'net banking') paymentValue = 'netbanking';

          // Validate category
          if (!validCategories.includes(categoryValue)) {
            throw new Error(
              `Invalid category "${expense.category}". Must be one of: Food, Transport, Shopping, Bills, Entertainment, Health, or Other`
            );
          }

          // Validate payment method if provided
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

      // Save custom activities
      if (data?.customActivities?.templates) {
        for (const activityName of data.customActivities.templates) {
          const activityData = customActivities[activityName];
          if (activityData?.duration) {
            await api.post('/customactivities', {
              date: selectedDate,
              name: activityName,
              duration: Number(activityData.duration),
              ...(activityData.notes && { notes: activityData.notes }),
            });
          }
        }
      }

      // Refetch data for the selected date
      await onSuccess?.(selectedDate);

      setSnackbar({ open: true, message: 'Changes saved successfully! ✓', severity: 'success' });
    } catch (err) {
      console.error('Failed to save activities:', err);
      setSnackbar({
        open: true,
        message: 'Failed to save changes. Please try again.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if there are any changes
  const hasChanges =
    sleepHours ||
    exerciseDuration ||
    daylogNotes ||
    mealData.mealRows.some((m) => m.foodName || m.calories) ||
    expenseData.expenseRows.some((e) => e.amount || e.description) ||
    Object.values(customActivities).some((a) => a.duration || a.notes);

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        Today's Activities
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
      >
        Track your daily activities in an easy-to-use interface
      </Typography>

      {/* Sleep & Exercise */}
      <SleepExerciseForm
        sleepHours={sleepHours}
        setSleepHours={setSleepHours}
        sleepStartTime={sleepStartTime}
        setSleepStartTime={setSleepStartTime}
        sleepEndTime={sleepEndTime}
        setSleepEndTime={setSleepEndTime}
        exerciseType={exerciseType}
        setExerciseType={setExerciseType}
        exerciseDuration={exerciseDuration}
        setExerciseDuration={setExerciseDuration}
        exerciseStartTime={exerciseStartTime}
        setExerciseStartTime={setExerciseStartTime}
        exerciseEndTime={exerciseEndTime}
        setExerciseEndTime={setExerciseEndTime}
      />

      {/* Custom Activities */}
      <CustomActivityForm
        templates={data?.customActivities?.templates || []}
        customActivities={customActivities}
        onUpdateActivity={handleUpdateActivity}
      />

      {/* Meals Section */}
      <MealsSection
        mealRows={mealData.mealRows}
        onAddRow={mealData.addMealRow}
        onRemoveRow={mealData.removeMealRow}
        onUpdateRow={mealData.updateMealRow}
      />

      {/* Expenses */}
      <ExpenseTable
        rows={expenseData.expenseRows}
        onAddRow={expenseData.addExpenseRow}
        onRemoveRow={expenseData.removeExpenseRow}
        onUpdateRow={expenseData.updateExpenseRow}
      />

      {/* Daily Notes */}
      <Paper
        elevation={0}
        sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider', mb: 3 }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          📝 Daily Notes
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          value={daylogNotes}
          onChange={(e) => setDaylogNotes(e.target.value)}
          placeholder="How was your day? Any reflections or highlights?"
          sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
        />
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSaveAll}
          disabled={submitting || !hasChanges}
          sx={{
            minWidth: { xs: 120, sm: 140 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 1, sm: 1.5 },
          }}
        >
          {submitting ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>

      {/* Success/Error Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodayActivityLog;
