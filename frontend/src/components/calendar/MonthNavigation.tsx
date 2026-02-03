import { Box, IconButton, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface MonthNavigationProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const MonthNavigation = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: MonthNavigationProps) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 3 },
        flexWrap: 'wrap',
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        <IconButton onClick={onPrevMonth} size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
          <ChevronLeft fontSize="medium" />
        </IconButton>
        <Box
          sx={{
            typography: { xs: 'h6', sm: 'h5' },
            fontWeight: 600,
            minWidth: { xs: 150, sm: 180 },
            textAlign: 'center',
          }}
        >
          {monthName} {year}
        </Box>
        <IconButton onClick={onNextMonth} size="small" sx={{ p: { xs: 0.5, sm: 1 } }}>
          <ChevronRight fontSize="medium" />
        </IconButton>
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={onToday}
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      >
        Today
      </Button>
    </Box>
  );
};

export default MonthNavigation;
