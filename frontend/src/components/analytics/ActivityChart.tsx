import { type FC, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ShowChart, BarChart as BarChartIcon, StackedLineChart } from '@mui/icons-material';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface ActivityChartProps {
  title: string;
  subtitle?: string;
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  unit?: string;
  isLoading?: boolean;
  showChartTypeToggle?: boolean;
}

type ChartType = 'line' | 'bar' | 'area';

export const ActivityChart: FC<ActivityChartProps> = ({
  title,
  subtitle,
  data,
  dataKey,
  color = '#1976d2',
  unit = '',
  isLoading = false,
  showChartTypeToggle = true,
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('area');

  if (isLoading) {
    return <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />;
  }

  interface TooltipPayload {
    value: number;
    payload: { label?: string; date?: string };
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {payload[0].payload.label || payload[0].payload.date}
          </Typography>
          <Typography variant="body2" color={color}>
            {payload[0].value} {unit}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 5, left: -20, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={theme.palette.text.secondary}
            />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={`${title} (${unit})`}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={theme.palette.text.secondary}
            />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey={dataKey} fill={color} name={`${title} (${unit})`} radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={theme.palette.text.secondary}
            />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
              name={`${title} (${unit})`}
            />
          </AreaChart>
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Box sx={{ maxWidth: '100%' }}>
          <Typography
            variant="h6"
            fontWeight={600}
            gutterBottom
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {showChartTypeToggle && (
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(_, newType) => newType && setChartType(newType)}
            size="small"
          >
            <ToggleButton value="area" aria-label="area chart">
              <StackedLineChart fontSize="small" />
            </ToggleButton>
            <ToggleButton value="line" aria-label="line chart">
              <ShowChart fontSize="small" />
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      <Box
        sx={{
          height: { xs: 250, sm: 300, md: 300 },
          width: '100%',
          minHeight: 250,
          position: 'relative',
        }}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ActivityChart;
