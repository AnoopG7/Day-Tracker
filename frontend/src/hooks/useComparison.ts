import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import api from '@services/api';

export interface ComparisonData {
  daily: {
    sleep: {
      today: number;
      yesterday: number;
      change: number;
      changePercent: number;
    };
    exercise: {
      today: number;
      yesterday: number;
      change: number;
      changePercent: number;
    };
    calories: {
      today: number;
      yesterday: number;
      change: number;
      changePercent: number;
    };
    expenses: {
      today: number;
      yesterday: number;
      change: number;
      changePercent: number;
    };
  };
  dates: {
    today: string;
    yesterday: string;
  };
}

export interface UseComparisonReturn {
  data: ComparisonData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching comparison data (today vs yesterday)
 */
export function useComparison(): UseComparisonReturn {
  const { showNotification } = useAppContext();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/trends/comparison');
      setData(response.data.data);
    } catch {
      const errorMessage = 'Failed to load comparison data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

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
    refetch: fetchComparison,
  };
}

export default useComparison;
