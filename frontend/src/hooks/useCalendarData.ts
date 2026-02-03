import { useQuery } from '@tanstack/react-query';
import { getMonthCalendarData } from '@services/calendar.service';
import type { CalendarDayData } from '@/types/calendar.types';

/**
 * Hook to fetch and manage calendar data for a specific month
 */
export const useCalendarData = (year: number, month: number) => {
  const query = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => getMonthCalendarData(year, month),
    staleTime: 0, // Always fetch fresh data to avoid wrong month cache
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Convert map to object for easier access
  const dayData = query.data?.days || new Map<string, CalendarDayData>();
  const stats = query.data?.stats || {
    totalDays: 0,
    completeDays: 0,
    partialDays: 0,
    emptyDays: 0,
    avgSleepHours: 0,
    totalExerciseMinutes: 0,
    totalExpenses: 0,
    daysWithData: 0,
  };

  const getDayData = (date: string): CalendarDayData | null => {
    return dayData.get(date) || null;
  };

  return {
    dayData: getDayData,
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
