import { type ReactElement, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarMonth,
  DateRange,
  Today,
  Bedtime,
  FitnessCenter,
  Restaurant,
  AttachMoney,
  Timeline,
  CheckCircle,
  Info,
  Warning,
  EmojiEvents,
} from '@mui/icons-material';
import { MainLayout } from '@components/layout';
import { ErrorBoundary } from '@components/common';
import { MetricCard, ComparisonSection, ActivityChart, InsightsPanel } from '@components/analytics';
import { useWeeklyTrends } from '@hooks/useWeeklyTrends';
import { useMonthlyTrends } from '@hooks/useMonthlyTrends';
import { useYearlyTrends } from '@hooks/useYearlyTrends';
import { useComparison } from '@hooks/useComparison';

type TimeRange = 'week' | 'month' | 'year';

interface MetricTotals {
  sleep: number;
  exercise: number;
  calories: number;
  expenses: number;
}

interface Insight {
  type: 'success' | 'info' | 'warning' | 'achievement';
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

interface MonthlyDataPoint {
  month: string;
  year: number;
  averages?: { sleep?: number; exercise?: number; calories?: number };
  totals?: { expenses?: number };
}

interface DailyDataPoint {
  date: string;
  sleep?: number;
  exercise?: number;
  calories?: number;
  expenses?: number;
}

/** Analytics page with comprehensive trends and insights */
export default function AnalyticsPage(): ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const { data: weeklyTrends, isLoading: weeklyLoading } = useWeeklyTrends();
  const { data: monthlyTrends, isLoading: monthlyLoading } = useMonthlyTrends();
  const { data: yearlyTrends, isLoading: yearlyLoading } = useYearlyTrends();
  const { data: comparisonData, isLoading: comparisonLoading } = useComparison();

  // Select data based on time range
  const currentData =
    timeRange === 'week' ? weeklyTrends : timeRange === 'month' ? monthlyTrends : yearlyTrends;
  const isLoading =
    timeRange === 'week' ? weeklyLoading : timeRange === 'month' ? monthlyLoading : yearlyLoading;

  // Helper function to get totals (handles both weekly/monthly and yearly structures)
  const getTotals = useCallback((): MetricTotals => {
    if (!currentData) return { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    if (timeRange === 'year' && 'yearlyTotals' in currentData) {
      return currentData.yearlyTotals || { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    }
    if ('totals' in currentData) {
      return currentData.totals || { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    }
    return { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
  }, [currentData, timeRange]);

  // Helper function to get averages (handles both weekly/monthly and yearly structures)
  const getAverages = useCallback((): MetricTotals => {
    if (!currentData) return { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    if (timeRange === 'year' && 'yearlyAverages' in currentData) {
      return currentData.yearlyAverages || { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    }
    if ('averages' in currentData) {
      return currentData.averages || { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
    }
    return { sleep: 0, exercise: 0, calories: 0, expenses: 0 };
  }, [currentData, timeRange]);

  // Helper function to get chart data (handles dailyData vs monthlyData)
  const getChartDataSource = (): MonthlyDataPoint[] | DailyDataPoint[] => {
    if (!currentData) return [];
    if (timeRange === 'year' && 'monthlyData' in currentData) {
      return currentData.monthlyData || [];
    }
    if ('dailyData' in currentData) {
      return currentData.dailyData || [];
    }
    return [];
  };

  // Helper function to get sparkline data
  const getSparklineData = (metric: 'sleep' | 'exercise' | 'calories' | 'expenses'): number[] => {
    if (!currentData) return [];
    if (timeRange === 'year' && 'monthlyData' in currentData) {
      const monthlyData = currentData.monthlyData || [];
      if (metric === 'expenses') {
        return monthlyData.map((d) => d.totals?.expenses || 0);
      }
      return monthlyData.map((d) => d.averages?.[metric] || 0);
    }
    if ('dailyData' in currentData) {
      const dailyData = currentData.dailyData || [];
      return dailyData.map((d) => d[metric] || 0);
    }
    return [];
  };

  // Format chart data with proper labels
  const formatChartData = (
    data: MonthlyDataPoint[] | DailyDataPoint[],
    key: string
  ): ChartDataPoint[] => {
    if (!data || data.length === 0) return [];

    // For yearly data (monthlyData)
    if (timeRange === 'year' && 'month' in data[0]) {
      return (data as MonthlyDataPoint[]).map((item) => {
        const value =
          key === 'expenses'
            ? item.totals?.expenses
            : item.averages?.[key as keyof typeof item.averages];
        return {
          date: item.month,
          value: value || 0,
          label: `${item.month} ${item.year}`,
        };
      });
    }

    // For weekly/monthly data (dailyData)
    return (data as DailyDataPoint[]).map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: (item[key as keyof DailyDataPoint] as number) || 0,
      label: new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    }));
  };

  // Get custom activities from current data
  const getCustomActivities = useCallback(() => {
    if (!currentData || !('customActivities' in currentData)) {
      return [];
    }
    return currentData.customActivities || [];
  }, [currentData]);

  // Format custom activity chart data
  const formatCustomActivityData = useCallback(
    (activityName: string): ChartDataPoint[] => {
      const customActivities = getCustomActivities();
      const activity = customActivities.find((a) => a.name === activityName);
      if (!activity) return [];

      if (timeRange === 'year' && 'monthlyAverages' in activity) {
        // Yearly data
        return activity.monthlyAverages.map((monthData) => ({
          date: monthData.month,
          value: monthData.averageMinutes,
          label: monthData.month,
        }));
      } else if ('dailyMinutes' in activity) {
        // Weekly/Monthly data
        const dates = Object.keys(activity.dailyMinutes).sort();
        return dates.map((date) => ({
          date: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: activity.dailyMinutes[date] || 0,
          label: new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
        }));
      }
      return [];
    },
    [getCustomActivities, timeRange]
  );

  // Generate insights based on data
  const insights = useMemo(() => {
    if (!currentData || !comparisonData) return [];

    const generatedInsights: Insight[] = [];
    const averages = getAverages();
    const totals = getTotals();

    // ============= SLEEP INSIGHTS =============
    const avgSleep = averages.sleep;

    // Optimal sleep pattern
    if (avgSleep >= 7 && avgSleep <= 9) {
      generatedInsights.push({
        type: 'success',
        icon: <CheckCircle />,
        title: '😴 Excellent Sleep Pattern!',
        description: `You're averaging ${avgSleep.toFixed(1)} hours of sleep, which is within the recommended 7-9 hours. Keep it up!`,
      });
    }
    // Good but could be better
    else if (avgSleep >= 6 && avgSleep < 7) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'Almost There!',
        description: `You're getting ${avgSleep.toFixed(1)} hours of sleep. Try adding just ${Math.ceil((7 - avgSleep) * 60)} more minutes to reach the recommended 7-hour minimum.`,
      });
    }
    // Sleep deficit
    else if (avgSleep > 0 && avgSleep < 6) {
      const hoursNeeded = (7 - avgSleep).toFixed(1);
      generatedInsights.push({
        type: 'warning',
        icon: <Warning />,
        title: '⚠️ Sleep Deficit Detected',
        description: `Your average sleep of ${avgSleep.toFixed(1)} hours is below recommended levels. You need ${hoursNeeded} more hours per night for optimal health and recovery.`,
      });
    }

    // Sleep consistency (today vs yesterday)
    if (comparisonData.daily.sleep.today >= 7 && comparisonData.daily.sleep.yesterday >= 7) {
      generatedInsights.push({
        type: 'achievement',
        icon: <EmojiEvents />,
        title: '🎯 Consistent Sleep Schedule',
        description: `Great job maintaining healthy sleep! You've been getting 7+ hours for 2 days in a row.`,
      });
    }

    // ============= EXERCISE INSIGHTS =============
    const avgExercise = averages.exercise;

    // WHO recommendation met
    if (avgExercise >= 30) {
      const extraMinutes = Math.round(avgExercise - 30);
      generatedInsights.push({
        type: 'achievement',
        icon: <EmojiEvents />,
        title: '🏆 Fitness Goal Crushed!',
        description: `You're averaging ${Math.round(avgExercise)} minutes of exercise per day—that's ${extraMinutes} minutes above the WHO recommendation! Outstanding commitment to fitness.`,
      });
    }
    // Building up to goal
    else if (avgExercise >= 15 && avgExercise < 30) {
      const minutesNeeded = Math.ceil(30 - avgExercise);
      const percentProgress = Math.round((avgExercise / 30) * 100);
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: '💪 Building Momentum',
        description: `You're ${percentProgress}% of the way to your 30-minute daily goal! Just ${minutesNeeded} more minutes to hit the WHO recommendation.`,
      });
    }
    // Low activity
    else if (avgExercise > 0 && avgExercise < 15) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'Start Small, Win Big',
        description: `You're exercising ${Math.round(avgExercise)} minutes daily. Try adding 5 minutes each week to gradually build up to the 30-minute goal.`,
      });
    }

    // Exercise improvement trend
    if (comparisonData.daily.exercise.changePercent > 25) {
      generatedInsights.push({
        type: 'success',
        icon: <CheckCircle />,
        title: '📈 Exercise Trending Up!',
        description: `Your exercise increased ${comparisonData.daily.exercise.changePercent}% today! This positive momentum will compound over time.`,
      });
    }

    // ============= EXPENSE INSIGHTS =============
    const expenseChange = comparisonData.daily.expenses.changePercent;

    // Great savings
    if (expenseChange < -15) {
      generatedInsights.push({
        type: 'success',
        icon: <CheckCircle />,
        title: '💰 Great Savings!',
        description: `Your spending is down ${Math.abs(expenseChange)}% compared to yesterday. You're on track to save ₹${Math.round(Math.abs(comparisonData.daily.expenses.change) * 30)} this month!`,
      });
    }
    // Moderate reduction
    else if (expenseChange < -5 && expenseChange >= -15) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'Smart Spending',
        description: `You reduced spending by ${Math.abs(expenseChange)}% today. Small wins add up!`,
      });
    }
    // Moderate increase
    else if (expenseChange > 10 && expenseChange <= 30) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'Spending Uptick',
        description: `Your spending increased ${expenseChange}% today. Keep an eye on your budget for the rest of the week.`,
      });
    }
    // High spending alert
    else if (expenseChange > 30) {
      generatedInsights.push({
        type: 'warning',
        icon: <Warning />,
        title: '🚨 Spending Alert',
        description: `Your spending spiked ${expenseChange}% today! Review your expenses and adjust if needed to stay on budget.`,
      });
    }

    // Budget projection
    if (timeRange === 'week' && totals.expenses > 0) {
      const avgDailyExpense = totals.expenses / 7;
      const monthlyProjection = Math.round(avgDailyExpense * 30);
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: '📊 Monthly Projection',
        description: `Based on this week's average of ₹${Math.round(avgDailyExpense)}/day, you're on track to spend ~₹${monthlyProjection} this month.`,
      });
    }

    // ============= NUTRITION INSIGHTS =============
    const avgCalories = averages.calories;

    // Tracking calories
    if (avgCalories >= 1800 && avgCalories <= 2500) {
      generatedInsights.push({
        type: 'success',
        icon: <CheckCircle />,
        title: '🥗 Balanced Nutrition',
        description: `You're averaging ${Math.round(avgCalories)} calories per day, which is within a healthy range for most adults.`,
      });
    }
    // Low calorie intake
    else if (avgCalories > 0 && avgCalories < 1500) {
      generatedInsights.push({
        type: 'warning',
        icon: <Warning />,
        title: 'Low Calorie Intake',
        description: `You're averaging only ${Math.round(avgCalories)} calories per day. Make sure you're eating enough to fuel your activities and maintain energy.`,
      });
    }
    // High calorie intake
    else if (avgCalories > 2800) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'High Calorie Intake',
        description: `You're averaging ${Math.round(avgCalories)} calories per day. Ensure this aligns with your activity level and goals.`,
      });
    }
    // Basic tracking reminder
    else if (avgCalories > 0 && avgCalories < 1800) {
      generatedInsights.push({
        type: 'info',
        icon: <Info />,
        title: 'Keep Tracking',
        description: `You're averaging ${Math.round(avgCalories)} calories per day. Consistent tracking helps you understand your nutrition patterns!`,
      });
    }

    // ============= CORRELATION INSIGHTS =============
    // Sleep & Exercise correlation
    if (avgSleep >= 7 && avgExercise >= 30) {
      generatedInsights.push({
        type: 'achievement',
        icon: <EmojiEvents />,
        title: '⚡ Winning Combo!',
        description:
          "You're nailing both sleep AND exercise! This powerful combination boosts energy, mood, and overall health.",
      });
    }

    // Sleep deficit but exercising
    if (avgSleep < 6 && avgExercise >= 20) {
      generatedInsights.push({
        type: 'warning',
        icon: <Warning />,
        title: 'Recovery Alert',
        description:
          "You're exercising regularly but not getting enough sleep. Your body needs 7-9 hours to recover and build strength!",
      });
    }

    // ============= MOTIVATIONAL INSIGHTS =============
    // All metrics tracked
    if (avgSleep > 0 && avgExercise > 0 && avgCalories > 0 && totals.expenses > 0) {
      generatedInsights.push({
        type: 'achievement',
        icon: <EmojiEvents />,
        title: '🌟 Full Spectrum Tracking',
        description: `You're tracking all aspects of your life! This comprehensive data gives you powerful insights for continuous improvement.`,
      });
    }

    return generatedInsights;
  }, [currentData, comparisonData, timeRange, getAverages, getTotals]);

  // Prepare comparison data
  const todayVsYesterday = comparisonData
    ? [
        {
          label: 'Sleep',
          current: comparisonData.daily.sleep.today,
          previous: comparisonData.daily.sleep.yesterday,
          unit: 'hrs',
          color: 'primary' as const,
        },
        {
          label: 'Exercise',
          current: comparisonData.daily.exercise.today,
          previous: comparisonData.daily.exercise.yesterday,
          unit: 'min',
          color: 'success' as const,
        },
        {
          label: 'Calories',
          current: comparisonData.daily.calories.today,
          previous: comparisonData.daily.calories.yesterday,
          unit: 'kcal',
          color: 'warning' as const,
        },
        {
          label: 'Expenses',
          current: comparisonData.daily.expenses.today,
          previous: comparisonData.daily.expenses.yesterday,
          unit: '₹',
          color: 'error' as const,
        },
      ]
    : [];

  return (
    <MainLayout>
      <ErrorBoundary>
        {isLoading ? (
          <Container
            maxWidth="xl"
            sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 }, overflowX: 'hidden' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid key={i} size={{ xs: 12, lg: 6 }}>
                    <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        ) : (
          <Container
            maxWidth="xl"
            sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 }, overflowX: 'hidden' }}
          >
            {/* Header Section */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, mb: 1 }}>
                <Timeline sx={{ fontSize: 36, color: 'primary.main' }} />
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Analytics Dashboard
                </Typography>
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
              >
                Comprehensive insights into your health, fitness, and lifestyle patterns
              </Typography>
            </Box>

            {/* Time Range Selector */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 0.5, sm: 1, md: 1.5 },
                mb: { xs: 3, md: 4 },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
              }}
            >
              <Tabs
                value={timeRange}
                onChange={(_, newValue) => setTimeRange(newValue)}
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: { xs: 48, sm: 56 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600,
                  },
                }}
              >
                <Tab
                  icon={<Today />}
                  iconPosition="start"
                  label="Weekly"
                  value="week"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<CalendarMonth />}
                  iconPosition="start"
                  label="Monthly"
                  value="month"
                  sx={{ gap: 1 }}
                />
                <Tab
                  icon={<DateRange />}
                  iconPosition="start"
                  label="Yearly"
                  value="year"
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Paper>

            {/* Key Metrics Overview */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{ mb: 2, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                📊 Key Metrics Overview
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <MetricCard
                    title="Average Sleep"
                    value={getAverages().sleep.toFixed(1)}
                    unit="hrs"
                    change={comparisonData?.daily.sleep.change}
                    changePercent={comparisonData?.daily.sleep.changePercent}
                    trend={
                      comparisonData?.daily.sleep.change
                        ? comparisonData.daily.sleep.change > 0
                          ? 'up'
                          : 'down'
                        : 'flat'
                    }
                    sparklineData={getSparklineData('sleep')}
                    color="primary"
                    icon={<Bedtime />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <MetricCard
                    title="Average Exercise"
                    value={getAverages().exercise || '0'}
                    unit="min"
                    change={comparisonData?.daily.exercise.change}
                    changePercent={comparisonData?.daily.exercise.changePercent}
                    trend={
                      comparisonData?.daily.exercise.change
                        ? comparisonData.daily.exercise.change > 0
                          ? 'up'
                          : 'down'
                        : 'flat'
                    }
                    sparklineData={getSparklineData('exercise')}
                    color="success"
                    icon={<FitnessCenter />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <MetricCard
                    title="Average Calories"
                    value={getAverages().calories || '0'}
                    unit="kcal"
                    change={comparisonData?.daily.calories.change}
                    changePercent={comparisonData?.daily.calories.changePercent}
                    trend={
                      comparisonData?.daily.calories.change
                        ? comparisonData.daily.calories.change > 0
                          ? 'up'
                          : 'down'
                        : 'flat'
                    }
                    sparklineData={getSparklineData('calories')}
                    color="warning"
                    icon={<Restaurant />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <MetricCard
                    title="Total Expenses"
                    value={`₹${getTotals().expenses.toFixed(2)}`}
                    change={comparisonData?.daily.expenses.change}
                    changePercent={comparisonData?.daily.expenses.changePercent}
                    trend={
                      comparisonData?.daily.expenses.change
                        ? comparisonData.daily.expenses.change > 0
                          ? 'up'
                          : 'down'
                        : 'flat'
                    }
                    sparklineData={getSparklineData('expenses')}
                    color="error"
                    icon={<AttachMoney />}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            {/* Comparison Section */}
            {!comparisonLoading && comparisonData && (
              <ComparisonSection
                title="📈 Today vs Yesterday"
                subtitle="See how today's performance compares to yesterday"
                comparisons={todayVsYesterday}
              />
            )}

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            {/* Activity Deep Dives */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                📉 Activity Trends
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {/* Sleep Trend */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ActivityChart
                    title="Sleep Pattern"
                    subtitle={
                      timeRange === 'week'
                        ? 'Last 7 days'
                        : timeRange === 'month'
                          ? 'Last 30 days'
                          : 'Last 12 months'
                    }
                    data={formatChartData(getChartDataSource(), 'sleep')}
                    dataKey="value"
                    color={theme.palette.primary.main}
                    unit="hrs"
                    isLoading={isLoading}
                    showChartTypeToggle
                  />
                </Grid>

                {/* Exercise Trend */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ActivityChart
                    title="Exercise Activity"
                    subtitle={
                      timeRange === 'week'
                        ? 'Last 7 days'
                        : timeRange === 'month'
                          ? 'Last 30 days'
                          : 'Last 12 months'
                    }
                    data={formatChartData(getChartDataSource(), 'exercise')}
                    dataKey="value"
                    color={theme.palette.success.main}
                    unit="min"
                    isLoading={isLoading}
                    showChartTypeToggle
                  />
                </Grid>

                {/* Nutrition Trend */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ActivityChart
                    title="Calorie Intake"
                    subtitle={
                      timeRange === 'week'
                        ? 'Last 7 days'
                        : timeRange === 'month'
                          ? 'Last 30 days'
                          : 'Last 12 months'
                    }
                    data={formatChartData(getChartDataSource(), 'calories')}
                    dataKey="value"
                    color={theme.palette.warning.main}
                    unit="kcal"
                    isLoading={isLoading}
                    showChartTypeToggle
                  />
                </Grid>

                {/* Expense Trend */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <ActivityChart
                    title="Daily Spending"
                    subtitle={
                      timeRange === 'week'
                        ? 'Last 7 days'
                        : timeRange === 'month'
                          ? 'Last 30 days'
                          : 'Last 12 months'
                    }
                    data={formatChartData(getChartDataSource(), 'expenses')}
                    dataKey="value"
                    color={theme.palette.error.main}
                    unit="₹"
                    isLoading={isLoading}
                    showChartTypeToggle
                  />
                </Grid>

                {/* Custom Activities Charts */}
                {getCustomActivities().map((activity, index) => {
                  const avgMinutes =
                    'averageMinutes' in activity
                      ? activity.averageMinutes
                      : 'yearlyAverage' in activity
                        ? activity.yearlyAverage
                        : 0;
                  return (
                    <Grid size={{ xs: 12, lg: 6 }} key={activity.name}>
                      <ActivityChart
                        title={`${activity.name.charAt(0).toUpperCase() + activity.name.slice(1)} Activity`}
                        subtitle={
                          timeRange === 'week'
                            ? `Last 7 days • Avg: ${avgMinutes} min`
                            : timeRange === 'month'
                              ? `Last 30 days • Avg: ${avgMinutes} min`
                              : `Last 12 months • Yearly Avg: ${avgMinutes} min`
                        }
                        data={formatCustomActivityData(activity.name)}
                        dataKey="value"
                        color={
                          [
                            theme.palette.info.main,
                            theme.palette.secondary.main,
                            '#9c27b0',
                            '#ff9800',
                            '#00bcd4',
                            '#8bc34a',
                          ][index % 6]
                        }
                        unit="min"
                        isLoading={isLoading}
                        showChartTypeToggle
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Divider sx={{ my: { xs: 3, md: 4 } }} />

            {/* Insights Panel */}
            {insights.length > 0 && <InsightsPanel insights={insights} />}

            {/* Period Summary */}
            {currentData && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  📅 Period Summary
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Sleep
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {getTotals().sleep.toFixed(1)} hrs
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Exercise
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {getTotals().exercise} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Calories
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {getTotals().calories} kcal
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Spent
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="error.main">
                        ₹{getTotals().expenses.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Chip
                    label={`Data from ${currentData.period.start} to ${currentData.period.end}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Paper>
            )}
          </Container>
        )}
      </ErrorBoundary>
    </MainLayout>
  );
}
