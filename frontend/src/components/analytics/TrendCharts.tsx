import { type FC } from 'react';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DailyTrendData } from '@hooks/useWeeklyTrends';

interface WeeklyTrendChartProps {
  data: DailyTrendData[];
  isLoading?: boolean;
}

/**
 * Format date for chart display (e.g., "Mon 27" or "01/27")
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  return `${weekday} ${day}`;
};

/**
 * Weekly Sleep & Exercise Trend Chart
 */
export const SleepExerciseTrendChart: FC<WeeklyTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    sleep: d.sleep,
    exercise: d.exercise,
  }));

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        📊 Sleep & Exercise Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last 7 days
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            yAxisId="left"
            label={{ value: 'Sleep (hrs)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Exercise (min)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sleep"
            stroke="#1976d2"
            strokeWidth={2}
            name="Sleep (hrs)"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="exercise"
            stroke="#2e7d32"
            strokeWidth={2}
            name="Exercise (min)"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * Weekly Nutrition Trend Chart
 */
export const NutritionTrendChart: FC<WeeklyTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    calories: d.calories,
  }));

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        🍽️ Nutrition Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Daily calorie intake
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Calories', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="calories" fill="#ed6c02" name="Calories" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * Weekly Expense Trend Chart
 */
export const ExpenseTrendChart: FC<WeeklyTrendChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />;
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    expenses: d.expenses,
  }));

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        💰 Expense Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Daily spending
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="expenses" fill="#d32f2f" name="Expenses (₹)" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * Comparison Card showing today vs yesterday
 */
interface ComparisonCardProps {
  title: string;
  icon: string;
  today: number;
  yesterday: number;
  change: number;
  changePercent: number;
  unit: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const ComparisonCard: FC<ComparisonCardProps> = ({
  title,
  icon,
  today,
  yesterday,
  change,
  changePercent,
  unit,
  color = 'primary',
}) => {
  const isPositive = change > 0;
  const changeColor = isPositive ? 'success.main' : 'error.main';

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">{icon}</Typography>
        <Typography variant="subtitle1" fontWeight={600} color={`${color}.main`}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Today
        </Typography>
        <Typography variant="h6" fontWeight={600}>
          {today} {unit}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Yesterday
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {yesterday} {unit}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" fontWeight={600} color={changeColor}>
          {isPositive ? '+' : ''}
          {change} {unit}
        </Typography>
        <Typography variant="body2" color={changeColor}>
          ({isPositive ? '+' : ''}
          {changePercent}%)
        </Typography>
      </Box>
    </Paper>
  );
};
