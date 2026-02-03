import { useState, useEffect, useCallback } from 'react';
import api from '@services/api';

export interface DailyTrendData {
  date: string;
  sleep: number; // hours
  exercise: number; // minutes
  calories: number;
  expenses: number;
}

export interface CustomActivityData {
  name: string;
  totalMinutes: number;
  count: number;
  averageMinutes: number;
  dailyMinutes: Record<string, number>;
}

export interface WeeklyTrendsData {
  period: { start: string; end: string; days: number };
  dailyData: DailyTrendData[];
  averages: {
    sleep: number;
    exercise: number;
    calories: number;
    expenses: number;
  };
  totals: {
    sleep: number;
    exercise: number;
    calories: number;
    expenses: number;
  };
  customActivities: CustomActivityData[];
}

export interface UseWeeklyTrendsReturn {
  data: WeeklyTrendsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching weekly trend data (last 7 days)
 */
export function useWeeklyTrends(): UseWeeklyTrendsReturn {
  const [data, setData] = useState<WeeklyTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyTrends = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/trends/weekly');
      setData(response.data.data);
    } catch (err) {
      const errorMessage = 'Failed to load weekly trends';
      setError(errorMessage);
      console.error('Weekly trends fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch only once on mount
  useEffect(() => {
    fetchWeeklyTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once

  return {
    data,
    isLoading,
    error,
    refetch: fetchWeeklyTrends,
  };
}

export default useWeeklyTrends;
