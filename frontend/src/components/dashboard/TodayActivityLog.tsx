import { type FC, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Paper, Divider, TextField, Snackbar, Alert } from '@mui/material';

// Helper to capitalize first letter
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

import type { DashboardData } from '@/types/dashboard.types';
import { SleepExerciseForm } from './SleepExerciseForm';
import { MealsSection } from './MealsSection';
import { ExpenseTable } from './ExpenseTable';
import { CustomActivityForm } from './CustomActivityForm';
import { useMealData } from '@hooks/useMealData';
import { useExpenseData } from '@hooks/useExpenseData';
import { useSaveActivityLog } from '@hooks/useSaveActivityLog';

interface TodayActivityLogProps {
  selectedDate: string;
  data: DashboardData | null;
  onSuccess?: (date?: string) => void;
}

/**
 * Today's Activity Log - Modular Excel-like interface for daily tracking
 * Refactored to use useSaveActivityLog hook for save logic
 */
export const TodayActivityLog: FC<TodayActivityLogProps> = ({ selectedDate, data, onSuccess }) => {
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

  // Bundle sleep/exercise data for the save hook
  const sleepExerciseData = useMemo(() => ({
    sleepHours,
    sleepStartTime,
    sleepEndTime,
    exerciseDuration,
    exerciseType,
    exerciseStartTime,
    exerciseEndTime,
    daylogNotes,
  }), [sleepHours, sleepStartTime, sleepEndTime, exerciseDuration, exerciseType, exerciseStartTime, exerciseEndTime, daylogNotes]);

  // Use the save hook for all save logic
  const { submitting, snackbar, setSnackbar, handleSaveAll } = useSaveActivityLog(
    selectedDate,
    sleepExerciseData,
    mealData.mealRows,
    expenseData.expenseRows,
    customActivities,
    data,
    onSuccess
  );

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
