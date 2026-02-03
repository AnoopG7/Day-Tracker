import { useState, useEffect, useCallback } from 'react';
import api from '@services/api';
import type { DailyTrendData, CustomActivityData } from './useWeeklyTrends';

export interface MonthlyTrendsData {
  period: { start: string; end: string; days: number };
  dailyData: DailyTrendData[];
  weeklyBreakdown: Array<{
    week: number;
    period: { start: string; end: string };
    averages: {
      sleep: number;
      exercise: number;
      calories: number;
      expenses: number;
    };
  }>;
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

export interface UseMonthlyTrendsReturn {
  data: MonthlyTrendsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching monthly trend data (last 30 days)
 */
export function useMonthlyTrends(): UseMonthlyTrendsReturn {
  const [data, setData] = useState<MonthlyTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyTrends = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/trends/monthly');
      setData(response.data.data);
    } catch (err) {
      const errorMessage = 'Failed to load monthly trends';
      setError(errorMessage);
      console.error('Monthly trends fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch only once on mount
  useEffect(() => {
    fetchMonthlyTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run once

  return {
    data,
    isLoading,
    error,
    refetch: fetchMonthlyTrends,
  };
}

export default useMonthlyTrends;
