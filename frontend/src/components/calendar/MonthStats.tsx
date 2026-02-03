import { Box, Typography, Paper, Grid } from '@mui/material';
import type { MonthStats } from '@/types/calendar.types';

interface MonthStatsProps {
  stats: MonthStats;
}

const MonthStatsComponent = ({ stats }: MonthStatsProps) => {
  const completionPercentage =
    stats.totalDays > 0 ? Math.round((stats.completeDays / stats.totalDays) * 100) : 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {/* Main Stat - Completion */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" color="primary.main" fontWeight={700}>
              {completionPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Completion Rate
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {stats.completeDays}/{stats.totalDays} days complete
            </Typography>
          </Paper>
        </Grid>

        {/* Sleep Average */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              {stats.avgSleepHours.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Avg Sleep
            </Typography>
          </Paper>
        </Grid>

        {/* Exercise Total */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              {stats.totalExerciseMinutes}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Exercise Minutes
            </Typography>
          </Paper>
        </Grid>

        {/* Expenses Total */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              ₹{stats.totalExpenses.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Total Expenses
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MonthStatsComponent;
