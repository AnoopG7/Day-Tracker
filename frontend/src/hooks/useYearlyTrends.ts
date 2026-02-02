import { useState, useEffect } from 'react';
import api from '../services/api';
import useAppContext from '../stores/useAppStore';

interface MonthlyDataPoint {
  month: string;
  fullMonth: string;
  year: number;
  averages: {
    sleep: number;
    exercise: number;
    calories: number;
  };
  totals: {
    expenses: number;
  };
  daysWithData: number;
}

interface YearlyCustomActivityData {
  name: string;
  monthlyAverages: Array<{
    month: string;
    averageMinutes: number;
    count: number;
  }>;
  yearlyTotal: number;
  yearlyCount: number;
  yearlyAverage: number;
}

interface YearlyTrendsData {
  period: {
    start: string;
    end: string;
    months: number;
  };
  monthlyData: MonthlyDataPoint[];
  yearlyAverages: {
    sleep: number;
    exercise: number;
    calories: number;
    expenses: number;
  };
  yearlyTotals: {
    sleep: number;
    exercise: number;
    calories: number;
    expenses: number;
  };
  customActivities: YearlyCustomActivityData[];
}

export const useYearlyTrends = () => {
  const { isAuthenticated } = useAppContext();
  const [data, setData] = useState<YearlyTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYearlyTrends = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/trends/yearly');
        setData(response.data.data);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to fetch yearly trends');
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyTrends();
  }, [isAuthenticated]);

  return { data, isLoading: loading, error };
};

export default useYearlyTrends;
