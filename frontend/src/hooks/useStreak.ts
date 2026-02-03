import { useState, useEffect } from 'react';
import daylogService, { type StreakData } from '@services/daylog.service';

export interface UseStreakReturn {
  data: StreakData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching streak data
 * Tracks current and longest streak based on daily activity
 */
export function useStreak(): UseStreakReturn {
  const [data, setData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const streakData = await daylogService.getStreak();
      setData(streakData);
    } catch (err) {
      const errorMessage = 'Failed to load streak data';
      setError(errorMessage);
      console.error('Streak fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch only once on mount
  useEffect(() => {
    fetchStreak();
  }, []); // Empty dependency array - only run once

  return {
    data,
    isLoading,
    error,
    refetch: fetchStreak,
  };
}

export default useStreak;
