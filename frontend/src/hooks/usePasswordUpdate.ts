import { useState, useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import api from '@services/api';
import type { PasswordChangeFormData } from '@schemas/settings.schema';

export interface UsePasswordUpdateReturn {
  updatePassword: (data: PasswordChangeFormData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for updating user password
 */
export function usePasswordUpdate(): UsePasswordUpdateReturn {
  const { showNotification } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updatePassword = useCallback(
    async (data: PasswordChangeFormData): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        await api.put('/auth/update-password', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });

        showNotification('Password updated successfully', 'success');
        return true;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage = error.response?.data?.message || 'Failed to update password';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [showNotification]
  );

  return {
    updatePassword,
    isLoading,
    error,
    clearError,
  };
}

export default usePasswordUpdate;
