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
        p: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        minHeight: { xs: 100, sm: 120, md: 140 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: { xs: 1, sm: 1.5, md: 2 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}
        >
          {title}
        </Typography>
        {icon && (
          <Box
            sx={{
              p: { xs: 0.5, sm: 0.75, md: 1 },
              borderRadius: 1,
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
      >
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
