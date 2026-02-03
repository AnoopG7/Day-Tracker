import { Box, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DayCell from './DayCell';
import { useCalendarData } from '@hooks/useCalendarData';
import type { CompletionStatus } from '../../types/calendar.types';

interface MonthCalendarProps {
  currentDate: Date;
}

const MonthCalendar = ({ currentDate }: MonthCalendarProps) => {
  const navigate = useNavigate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch calendar data
  const { dayData, isLoading, isError } = useCalendarData(year, month);

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Get previous month's trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevMonthDays = startDayOfWeek;

  // Calculate total cells needed (always 42 for 6 rows)
  const totalCells = 42;
  const nextMonthDays = totalCells - prevMonthDays - daysInMonth;

  // Today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Generate calendar grid
  const calendarDays: Array<{
    date: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isFuture: boolean;
    isToday: boolean;
    status: CompletionStatus;
  }> = [];

  // Previous month days
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const data = dayData(dateStr);

    calendarDays.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isFuture: new Date(dateStr) > today,
      isToday: dateStr === todayStr,
      status: data?.completionStatus || 'empty',
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    const data = dayData(dateStr);

    calendarDays.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isFuture: dayDate > today,
      isToday: dateStr === todayStr,
      status: data?.completionStatus || (dayDate > today ? 'future' : 'empty'),
    });
  }

  // Next month days
  for (let day = 1; day <= nextMonthDays; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    calendarDays.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isFuture: true,
      isToday: false,
      status: 'future',
    });
  }

  const handleDayClick = (date: string) => {
    // Navigate to dashboard with the selected date
    navigate(`/dashboard?date=${date}`);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <Box>
        {/* Week day headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: { xs: 0.5, sm: 1 },
            mb: 1,
          }}
        >
          {weekDays.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                py: 1,
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: 'text.secondary',
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Loading skeletons */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              sx={{
                aspectRatio: '1',
                minHeight: { xs: 48, sm: 60, md: 70 },
                borderRadius: 1.5,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>
        Failed to load calendar data. Please try again.
      </Box>
    );
  }

  return (
    <Box>
      {/* Week day headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: { xs: 0.5, sm: 1 },
          mb: 1,
        }}
      >
        {weekDays.map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              py: 1,
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              color: 'text.secondary',
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {calendarDays.map((day, index) => (
          <DayCell
            key={index}
            date={day.date}
            dayNumber={day.dayNumber}
            completionStatus={day.status}
            isToday={day.isToday}
            isFuture={day.isFuture}
            isCurrentMonth={day.isCurrentMonth}
            onClick={handleDayClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MonthCalendar;
