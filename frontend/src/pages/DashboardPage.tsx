import { type ReactElement, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Alert,
  Skeleton,
  TextField,
  IconButton,
  Stack,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '@components/layout';
import { StatCard, ErrorBoundary } from '@components/common';
import { TodayActivityLog } from '@components/dashboard';
import {
  Bedtime as SleepIcon,
  FitnessCenter as ExerciseIcon,
  Restaurant as NutritionIcon,
  AttachMoney as ExpenseIcon,
  LocalFireDepartment as StreakIcon,
} from '@mui/icons-material';
import { useDashboard } from '@hooks/useDashboard';
import { useStreak } from '@hooks/useStreak';

/** Dashboard page with statistics and overview */
export default function DashboardPage(): ReactElement {
  const location = useLocation();

  // Get today's date in YYYY-MM-DD format (local timezone)
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Derive selected date from URL - no state sync needed
  const selectedDate = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('date') || today;
  }, [location.search, today]);

  // Setter function that updates URL (which triggers selectedDate recalculation)
  const setSelectedDate = (newDate: string) => {
    window.history.pushState({}, '', `/dashboard?date=${newDate}`);
    // Force re-render by triggering navigation
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const { data, isLoading, error, refetch } = useDashboard(selectedDate);
  const { data: streakData, isLoading: streakLoading } = useStreak();

  // Handle date navigation
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    // Don't allow future dates
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  return (
    <MainLayout>
      <ErrorBoundary>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          {/* Header with Date Selector */}
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              Dashboard
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <IconButton
                onClick={handlePreviousDay}
                aria-label="Previous day"
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  width: { xs: 44, sm: 40 },
                  height: { xs: 44, sm: 40 },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ChevronLeft sx={{ fontSize: { xs: 28, sm: 24 } }} />
              </IconButton>
              <TextField
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                size="small"
                inputProps={{
                  max: today,
                }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: 'none', sm: 200 },
                  '& .MuiInputBase-root': {
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    fontSize: { xs: '0.95rem', sm: '0.875rem' },
                    height: { xs: 44, sm: 40 },
                  },
                }}
              />
              <IconButton
                onClick={handleNextDay}
                disabled={selectedDate === today}
                aria-label="Next day"
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: selectedDate === today ? 'action.disabled' : 'divider',
                  borderRadius: 2,
                  width: { xs: 44, sm: 40 },
                  height: { xs: 44, sm: 40 },
                  '&:hover': {
                    bgcolor: selectedDate === today ? 'background.paper' : 'action.hover',
                  },
                }}
              >
                <ChevronRight sx={{ fontSize: { xs: 28, sm: 24 } }} />
              </IconButton>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, display: { xs: 'block', sm: 'none' } }}
            >
              {selectedDate === today
                ? "Today's overview"
                : new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
            </Typography>
          </Box>

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              Failed to load dashboard data. Please try again later.
            </Alert>
          )}

          {/* Stats Overview */}
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            {/* Sleep */}
            <Grid size={{ xs: 6, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              ) : (
                <StatCard
                  title="Sleep"
                  value={`${data?.daylog?.sleep?.duration ? (data.daylog.sleep.duration / 60).toFixed(1) : '0'} hrs`}
                  subtitle="today"
                  icon={<SleepIcon />}
                  color="primary"
                />
              )}
            </Grid>

            {/* Exercise */}
            <Grid size={{ xs: 6, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              ) : (
                <StatCard
                  title="Exercise"
                  value={`${data?.daylog?.exercise?.duration || 0} min`}
                  subtitle="today"
                  icon={<ExerciseIcon />}
                  color="success"
                />
              )}
            </Grid>

            {/* Nutrition */}
            <Grid size={{ xs: 6, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              ) : (
                <StatCard
                  title="Nutrition"
                  value={`${data?.nutrition.totals.calories || 0} cal`}
                  subtitle={`${data?.nutrition.totals.protein || 0}g protein`}
                  icon={<NutritionIcon />}
                  color="warning"
                />
              )}
            </Grid>

            {/* Expenses */}
            <Grid size={{ xs: 6, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              ) : (
                <StatCard
                  title="Expenses"
                  value={`₹${data?.expenses.totals.total?.toFixed(2) || '0.00'}`}
                  subtitle={`${data?.expenses.count || 0} entries`}
                  icon={<ExpenseIcon />}
                  color="error"
                />
              )}
            </Grid>

            {/* Streak */}
            <Grid size={{ xs: 6, sm: 6, lg: 2.4 }}>
              {streakLoading ? (
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              ) : (
                <StatCard
                  title="Streak"
                  value={`${streakData?.currentStreak || 0} days`}
                  subtitle={`Longest: ${streakData?.longestStreak || 0} days`}
                  icon={<StreakIcon />}
                  color="secondary"
                />
              )}
            </Grid>
          </Grid>

          {/* Today's Activity Log */}
          <Box sx={{ mb: 4 }}>
            <TodayActivityLog selectedDate={selectedDate} data={data} onSuccess={refetch} />
          </Box>
        </Container>
      </ErrorBoundary>
    </MainLayout>
  );
}
