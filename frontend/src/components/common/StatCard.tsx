import type { ReactElement, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

/** Statistics card for dashboards */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: StatCardProps): ReactElement {
  const isPositive = trend && trend.value >= 0;
  const trendColor = isPositive ? 'success.main' : 'error.main';

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor }}>
            {isPositive ? (
              <TrendingUpIcon sx={{ fontSize: 16 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="caption" fontWeight={600} sx={{ ml: 0.25 }}>
              {isPositive ? '+' : ''}
              {trend.value}%
            </Typography>
          </Box>
        )}
        {(subtitle || trend?.label) && (
          <Typography variant="caption" color="text.secondary">
            {trend?.label || subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default StatCard;
