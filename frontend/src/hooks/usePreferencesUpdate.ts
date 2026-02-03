import { useState, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import useAppStore from '@stores/useAppStore';
import api from '@services/api';

export interface UsePreferencesUpdateReturn {
  updateTimezone: (timezone: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for updating user preferences
 */
export function usePreferencesUpdate(): UsePreferencesUpdateReturn {
  const { showNotification } = useAppContext();
  const { user, setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateTimezone = useCallback(
    async (timezone: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.put('/auth/profile', { timezone });

        // Update user in context
        if (response.data.data && user) {
          setUser({
            ...user,
            timezone,
          });
        }

        showNotification('Timezone updated successfully', 'success');
        return true;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage = error.response?.data?.message || 'Failed to update timezone';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification, user, setUser]
  );

  return {
    updateTimezone,
    isLoading,
    error,
    clearError,
  };
}

export default usePreferencesUpdate;
