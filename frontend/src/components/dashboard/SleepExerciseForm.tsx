import { type FC } from 'react';
import { Grid, Paper, Typography, Divider, TextField, Autocomplete } from '@mui/material';

interface SleepExerciseFormProps {
  sleepHours: string;
  setSleepHours: (value: string) => void;
  sleepStartTime: string;
  setSleepStartTime: (value: string) => void;
  sleepEndTime: string;
  setSleepEndTime: (value: string) => void;
  exerciseType: string;
  setExerciseType: (value: string) => void;
  exerciseDuration: string;
  setExerciseDuration: (value: string) => void;
  exerciseStartTime: string;
  setExerciseStartTime: (value: string) => void;
  exerciseEndTime: string;
  setExerciseEndTime: (value: string) => void;
}

/**
 * Calculate duration in minutes between two times
 * Handles overnight sleep (e.g., 11 PM to 7 AM)
 */
function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // If end is earlier than start, assume it's next day (overnight)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  return endMinutes - startMinutes;
}

/**
 * Sleep and Exercise input form with time-based duration calculation
 */
export const SleepExerciseForm: FC<SleepExerciseFormProps> = ({
  sleepHours,
  setSleepHours,
  sleepStartTime,
  setSleepStartTime,
  sleepEndTime,
  setSleepEndTime,
  exerciseType,
  setExerciseType,
  exerciseDuration,
  setExerciseDuration,
  exerciseStartTime,
  setExerciseStartTime,
  exerciseEndTime,
  setExerciseEndTime,
}) => {
  // Auto-calculate sleep duration when times change
  const handleSleepTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setSleepStartTime(value);
      if (value && sleepEndTime) {
        const minutes = calculateDuration(value, sleepEndTime);
        setSleepHours((minutes / 60).toFixed(1));
      }
    } else {
      setSleepEndTime(value);
      if (sleepStartTime && value) {
        const minutes = calculateDuration(sleepStartTime, value);
        setSleepHours((minutes / 60).toFixed(1));
      }
    }
  };

  // Auto-calculate exercise duration when times change
  const handleExerciseTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setExerciseStartTime(value);
      if (value && exerciseEndTime) {
        const minutes = calculateDuration(value, exerciseEndTime);
        setExerciseDuration(String(minutes));
      }
    } else {
      setExerciseEndTime(value);
      if (exerciseStartTime && value) {
        const minutes = calculateDuration(exerciseStartTime, value);
        setExerciseDuration(String(minutes));
      }
    }
  };
  return (
    <>
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
      >
        ⚡ Daily Basics
      </Typography>
      <Grid container spacing={{ xs: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider' }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="primary"
              gutterBottom
              sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
            >
              💤 Sleep
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Time"
                  type="time"
                  value={sleepStartTime}
                  onChange={(e) => handleSleepTimeChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Time"
                  type="time"
                  value={sleepEndTime}
                  onChange={(e) => handleSleepTimeChange('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Hours slept"
                  type="number"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  inputProps={{ min: 0, max: 24, step: 0.5 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid', borderColor: 'divider' }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="success.main"
              gutterBottom
              sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
            >
              🏃 Exercise
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  options={[
                    'Running',
                    'Walking',
                    'Cycling',
                    'Swimming',
                    'Gym',
                    'Yoga',
                    'Sports',
                    'Cardio',
                  ]}
                  value={exerciseType}
                  onChange={(_, newValue) => setExerciseType(newValue || '')}
                  onInputChange={(_, newInputValue) => setExerciseType(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Exercise Type"
                      placeholder="Select or type custom"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Duration (min)"
                  type="number"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(e.target.value)}
                  inputProps={{ min: 0, max: 1440 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Time"
                  type="time"
                  value={exerciseStartTime}
                  onChange={(e) => handleExerciseTimeChange('start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Time"
                  type="time"
                  value={exerciseEndTime}
                  onChange={(e) => handleExerciseTimeChange('end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default SleepExerciseForm;
