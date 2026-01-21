import type { ReactElement } from 'react';
import { Box, LinearProgress, Typography, type LinearProgressProps } from '@mui/material';

export interface ProgressBarProps extends Omit<LinearProgressProps, 'value'> {
  value: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'inside';
  height?: number;
}

/** Progress bar with optional label */
export function ProgressBar({
  value,
  showLabel = false,
  labelPosition = 'right',
  height = 8,
  color = 'primary',
  ...props
}: ProgressBarProps): ReactElement {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const label = `${Math.round(normalizedValue)}%`;

  if (labelPosition === 'top') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          {showLabel && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={normalizedValue}
          color={color}
          sx={{ height, borderRadius: height / 2 }}
          {...props}
        />
      </Box>
    );
  }

  if (labelPosition === 'inside') {
    return (
      <Box sx={{ position: 'relative', height }}>
        <LinearProgress
          variant="determinate"
          value={normalizedValue}
          color={color}
          sx={{ height, borderRadius: height / 2 }}
          {...props}
        />
        {showLabel && normalizedValue > 10 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            {label}
          </Typography>
        )}
      </Box>
    );
  }

  // Default: right position
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={normalizedValue}
          color={color}
          sx={{ height, borderRadius: height / 2 }}
          {...props}
        />
      </Box>
      {showLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

export default ProgressBar;
