import { type FC } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'flat';
  sparklineData?: number[];
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

export const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  changePercent,
  trend,
  sparklineData,
  color = 'primary',
  icon,
}) => {
  const theme = useTheme();
  const colorValue = theme.palette[color].main;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp fontSize="small" />;
    if (trend === 'down') return <TrendingDown fontSize="small" />;
    return <TrendingFlat fontSize="small" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success.main';
    if (trend === 'down') return 'error.main';
    return 'text.secondary';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: `0 0 0 1px ${colorValue}20`,
        },
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 1.5,
          width: '100%',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: `${color}.main`,
              }}
            >
              {value}
            </Typography>
            {unit && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {unit}
              </Typography>
            )}
          </Box>
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: `${color}.main`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {/* Change Indicator */}
      {(change !== undefined || changePercent !== undefined) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Box sx={{ color: getTrendColor(), display: 'flex', alignItems: 'center' }}>
            {getTrendIcon()}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: getTrendColor() }}>
            {change !== undefined && `${change > 0 ? '+' : ''}${change} ${unit || ''}`}
            {changePercent !== undefined && ` (${changePercent > 0 ? '+' : ''}${changePercent}%)`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            vs last period
          </Typography>
        </Box>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <Box sx={{ height: 40, mt: 1, width: '100%', overflow: 'hidden' }}>
          <Sparklines data={sparklineData} width={100} height={40} style={{ width: '100%' }}>
            <SparklinesLine color={colorValue} style={{ strokeWidth: 2, fill: 'none' }} />
          </Sparklines>
        </Box>
      )}
    </Paper>
  );
};

export default MetricCard;
