import { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { MainLayout } from '@components/layout';
import MonthCalendar from '@components/calendar/MonthCalendar';
import MonthNavigation from '@components/calendar/MonthNavigation';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleMonthChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
          >
            Calendar
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Track your daily progress across months
          </Typography>
        </Box>

        {/* Month Navigation */}
        <MonthNavigation
          currentDate={currentDate}
          onMonthChange={handleMonthChange}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* Calendar Grid */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mb: 3,
          }}
        >
          <MonthCalendar currentDate={currentDate} />
        </Paper>

        {/* Completion Rules */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            mb: 2,
            backgroundColor: 'background.default',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📊 How Days Are Marked Complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A day turns <strong style={{ color: '#4caf50' }}>green (complete)</strong> when you log
            all three:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              ✅ Sleep (any duration recorded)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ✅ Exercise (any duration recorded)
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              ✅ At least 2 meals logged
            </Typography>
          </Box>
        </Paper>

        {/* Legend */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 2, sm: 3 },
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Complete', color: '#4caf50' },
            { label: 'Partial', color: '#ff9800' },
            { label: 'Empty', color: '#9e9e9e' },
            { label: 'Future', color: '#f5f5f5' },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  backgroundColor: item.color,
                  border: item.label === 'Future' ? '1px solid #e0e0e0' : 'none',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
};

export default CalendarPage;
