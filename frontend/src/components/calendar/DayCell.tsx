import { Box, Tooltip, useTheme, alpha } from '@mui/material';
import type { CompletionStatus } from '../../types/calendar.types';

interface DayCellProps {
  date: string | null; // YYYY-MM-DD or null for empty cells
  dayNumber: number | null;
  completionStatus: CompletionStatus;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
  onClick?: (date: string) => void;
}

const DayCell = ({
  date,
  dayNumber,
  completionStatus,
  isToday,
  isFuture,
  isCurrentMonth,
  onClick,
}: DayCellProps) => {
  const theme = useTheme();

  if (!date || !dayNumber) {
    // Empty cell (for grid padding)
    return <Box sx={{ aspectRatio: '1', minHeight: 48 }} />;
  }

  // Use theme colors instead of hardcoded values
  const getStatusColors = () => {
    switch (completionStatus) {
      case 'complete':
        return {
          bg: theme.palette.success.main,
          text: theme.palette.success.contrastText,
          border: theme.palette.success.dark,
        };
      case 'partial':
        return {
          bg: theme.palette.warning.main,
          text: theme.palette.warning.contrastText,
          border: theme.palette.warning.dark,
        };
      default: // empty or future
        return {
          bg: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.text.disabled, 0.2)
            : theme.palette.action.disabledBackground,
          text: theme.palette.text.secondary,
          border: theme.palette.divider,
        };
    }
  };

  const colors = isFuture 
    ? {
        bg: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.3)
          : theme.palette.grey[100],
        text: theme.palette.text.disabled,
        border: theme.palette.divider,
      }
    : getStatusColors();

  const handleClick = () => {
    if (!isFuture && onClick) {
      onClick(date);
    }
  };

  const tooltipTitle = isFuture
    ? 'Future date'
    : completionStatus === 'complete'
      ? 'All activities logged'
      : completionStatus === 'partial'
        ? 'Some activities logged'
        : 'No data logged';

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        onClick={handleClick}
        sx={{
          aspectRatio: '1',
          minHeight: { xs: 40, sm: 50, md: 60, lg: 70 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: { xs: 1, sm: 1.5 },
          backgroundColor: colors.bg,
          color: colors.text,
          border: isToday 
            ? `3px solid ${theme.palette.primary.main}` 
            : `1px solid ${colors.border}`,
          cursor: isFuture ? 'default' : 'pointer',
          fontWeight: isToday ? 700 : isCurrentMonth ? 600 : 400,
          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
          opacity: isCurrentMonth ? 1 : 0.4,
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': !isFuture
            ? {
                transform: 'scale(1.05)',
                boxShadow: 2,
                zIndex: 1,
              }
            : {},
          pointerEvents: isFuture ? 'none' : 'auto',
        }}
      >
        {dayNumber}
      </Box>
    </Tooltip>
  );
};

export default DayCell;
