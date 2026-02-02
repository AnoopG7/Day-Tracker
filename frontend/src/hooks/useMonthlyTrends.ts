import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
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
  const { showNotification } = useAppContext();
  const [data, setData] = useState<MonthlyTrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyTrends = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/trends/monthly');
      setData(response.data.data);
    } catch {
      const errorMessage = 'Failed to load monthly trends';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMonthlyTrends();
  }, [fetchMonthlyTrends]);

  // Separate effect for error notifications
  useEffect(() => {
    if (error) {
      showNotification(error, 'error');
    }
  }, [error, showNotification]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMonthlyTrends,
  };
}

export default useMonthlyTrends;
