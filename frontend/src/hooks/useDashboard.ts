import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import dashboardService from '@services/dashboard.service';
import type { DashboardData } from '@/types/dashboard.types';

export interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: (date?: string) => Promise<void>;
}

/**
 * Custom hook for fetching dashboard data
 * @param initialDate - Optional date in YYYY-MM-DD format
 */
export function useDashboard(initialDate?: string): UseDashboardReturn {
  const { showNotification } = useAppContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(
    async (date?: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getDashboard(date);
        setData(dashboardData);
      } catch (err: unknown) {
        const errorMessage = 'Failed to load dashboard data';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification]
  );

  // Initial fetch
  useEffect(() => {
    fetchDashboard(initialDate);
  }, [initialDate, fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}

export default useDashboard;
