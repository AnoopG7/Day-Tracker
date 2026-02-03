import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@context/AppContext';
import useAppStore from '@stores/useAppStore';
import api from '@services/api';

export interface UseAccountDeletionReturn {
  deleteAccount: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for account deletion
 */
export function useAccountDeletion(): UseAccountDeletionReturn {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const logout = useAppStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await api.delete('/auth/account');

      showNotification('Your account has been deleted', 'success');

      // Logout and redirect
      logout();
      navigate('/');
      return true;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to delete account';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification, logout, navigate]);

  return {
    deleteAccount,
    isLoading,
    error,
  };
}

export default useAccountDeletion;
