import { useState, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import useAppStore from '@stores/useAppStore';
import api from '@services/api';
import type { ProfileUpdateFormData } from '@schemas/settings.schema';

export interface UseProfileUpdateReturn {
  updateProfile: (data: ProfileUpdateFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for updating user profile
 */
export function useProfileUpdate(): UseProfileUpdateReturn {
  const { showNotification } = useAppContext();
  const { user, setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProfile = useCallback(
    async (data: ProfileUpdateFormData): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.put('/auth/profile', data);

        // Update user in context
        if (response.data.data) {
          setUser({
            ...user,
            ...response.data.data,
          });
        }

        showNotification('Profile updated successfully', 'success');
        return true;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage = error.response?.data?.message || 'Failed to update profile';
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
    updateProfile,
    isLoading,
    error,
    clearError,
  };
}

export default useProfileUpdate;
