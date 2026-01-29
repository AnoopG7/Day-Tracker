import { type ReactElement } from 'react';
import { Box, Container, Grid, Typography, Alert, Skeleton } from '@mui/material';
import { MainLayout } from '@components/layout';
import { StatCard, EmptyState } from '@components/common';
import {
  Bedtime as SleepIcon,
  FitnessCenter as ExerciseIcon,
  LocalFireDepartment as StreakIcon,
  Restaurant as NutritionIcon,
  AttachMoney as ExpenseIcon,
  DirectionsRun as ActivityIcon,
} from '@mui/icons-material';
import { useDashboard } from '@hooks/useDashboard';

/** Dashboard page with statistics and overview */
export default function DashboardPage(): ReactElement {
  const { data, isLoading, error } = useDashboard();

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome Back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's an overview of your daily progress
          </Typography>
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Sleep Hours"
                value={data?.daylog?.sleep?.hours?.toString() || '0'}
                subtitle="hrs"
                icon={<SleepIcon />}
                color="primary"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Exercise"
                value={data?.daylog?.exercise?.duration?.toString() || '0'}
                subtitle="min"
                icon={<ExerciseIcon />}
                color="success"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Activities"
                value={data?.activities.totalMinutes?.toString() || '0'}
                subtitle={`${data?.activities.count || 0} logged`}
                icon={<ActivityIcon />}
                color="warning"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Calories"
                value={data?.nutrition.totals.calories?.toString() || '0'}
                subtitle={`${data?.nutrition.count || 0} meals`}
                icon={<NutritionIcon />}
                color="info"
              />
            )}
          </Grid>
        </Grid>

        {/* Additional Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Total Expenses"
                value={`₹${data?.expenses.totals.total?.toFixed(2) || '0.00'}`}
                subtitle={`${data?.expenses.count || 0} entries`}
                icon={<ExpenseIcon />}
                color="error"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {isLoading ? (
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            ) : (
              <StatCard
                title="Mood"
                value={data?.daylog?.mood || 'Not set'}
                subtitle="today"
                icon={<StreakIcon />}
                color="secondary"
              />
            )}
          </Grid>
        </Grid>

        {/* Empty State - No Data */}
        {!isLoading && !error && !data?.daylog && data?.activities.count === 0 && (
          <EmptyState
            title="No activities logged yet"
            message="Start tracking your daily activities, meals, and expenses to see your progress here!"
          />
        )}
      </Container>
    </MainLayout>
  );
}
