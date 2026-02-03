import { type FC } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  unit: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

interface ComparisonSectionProps {
  title: string;
  subtitle: string;
  comparisons: ComparisonData[];
}

export const ComparisonSection: FC<ComparisonSectionProps> = ({ title, subtitle, comparisons }) => {
  const getChangeInfo = (current: number, previous: number) => {
    const change = current - previous;
    const percentChange = previous > 0 ? ((change / previous) * 100).toFixed(1) : 0;
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return {
      change,
      percentChange,
      isPositive,
      isNeutral,
      icon: isNeutral ? <Remove /> : isPositive ? <ArrowUpward /> : <ArrowDownward />,
      color: isNeutral ? 'default' : isPositive ? 'success' : 'error',
    };
  };

  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          {subtitle}
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, md: 2 }}>
        {comparisons.map((comparison, index) => {
          const changeInfo = getChangeInfo(comparison.current, comparison.previous);
          return (
            <Grid key={index} size={{ xs: 6, sm: 6, lg: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                  '&:hover': {
                    borderColor: `${comparison.color || 'primary'}.main`,
                    boxShadow: 2,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, mb: 1.5 }}
                >
                  {comparison.label}
                </Typography>

                {/* Current vs Previous */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: `${comparison.color || 'primary'}.main`,
                      }}
                    >
                      {comparison.current}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {comparison.unit}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      vs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {comparison.previous} {comparison.unit}
                    </Typography>
                  </Box>
                </Box>

                {/* Change Indicator */}
                <Chip
                  icon={changeInfo.icon}
                  label={`${changeInfo.isPositive ? '+' : ''}${changeInfo.change} (${changeInfo.isPositive ? '+' : ''}${changeInfo.percentChange}%)`}
                  color={changeInfo.color as 'success' | 'error' | 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ComparisonSection;
