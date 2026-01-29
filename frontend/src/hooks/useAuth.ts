import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@context/AppContext';
import useAppStore from '@stores/useAppStore';
import authService, {
  type LoginCredentials,
  type RegisterData,
  type ResetPasswordData,
} from '@services/auth.service';
import type { User } from '@/types/user.types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

/**
 * Custom hook for authentication
 * Manages auth state, login, register, logout, and password reset
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAppStore();

  /**
   * Initialize - fetch user if token exists
   */
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      if (authService.isAuthenticated() && !user) {
        try {
          setLoading(true);
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch {
          // Token invalid, clear auth
          authService.logout();
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [user, setUser, setLoading]);

  /**
   * Login handler
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setLoading(true);
        const { user: loggedInUser } = await authService.login(credentials);
        setUser(loggedInUser);
        showNotification(`Welcome back, ${loggedInUser.name}!`, 'success');
        navigate('/dashboard');
      } catch (error: unknown) {
        // Handle Axios errors with specific messages
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number; data?: { error?: { message?: string }; message?: string } } };
          const status = axiosError.response?.status;
          const serverMessage = axiosError.response?.data?.error?.message || axiosError.response?.data?.message;

          let errorMessage = 'Login failed. Please try again.';
          
          if (status === 401) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (status === 404) {
            errorMessage = 'No account found with this email address.';
          } else if (status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (status && status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (serverMessage) {
            errorMessage = serverMessage;
          }

          showNotification(errorMessage, 'error');
        } else if (error instanceof Error) {
          const errorMessage = error.message.includes('Network Error')
            ? 'Network error. Please check your internet connection.'
            : error.message;
          showNotification(errorMessage, 'error');
        } else {
          showNotification('An unexpected error occurred. Please try again.', 'error');
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setUser, setLoading, showNotification]
  );

  /**
   * Register handler
   */
  const register = useCallback(
    async (data: RegisterData): Promise<void> => {
      try {
        setLoading(true);
        const { user: newUser } = await authService.register(data);
        setUser(newUser);
        showNotification(`Welcome, ${newUser.name}! Your account has been created.`, 'success');
        navigate('/dashboard');
      } catch (error: unknown) {
        // Handle Axios errors with specific messages
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number; data?: { error?: { message?: string }; message?: string } } };
          const status = axiosError.response?.status;
          const serverMessage = axiosError.response?.data?.error?.message || axiosError.response?.data?.message;

          let errorMessage = 'Registration failed. Please try again.';
          
          if (status === 400) {
            // Check if it's a duplicate email error
            if (serverMessage?.toLowerCase().includes('already exists') || serverMessage?.toLowerCase().includes('duplicate')) {
              errorMessage = 'An account with this email already exists. Please sign in instead.';
            } else {
              errorMessage = serverMessage || 'Invalid registration data. Please check your information.';
            }
          } else if (status === 409) {
            errorMessage = 'An account with this email already exists. Please sign in instead.';
          } else if (status && status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (serverMessage) {
            errorMessage = serverMessage;
          }

          showNotification(errorMessage, 'error');
        } else if (error instanceof Error) {
          const errorMessage = error.message.includes('Network Error')
            ? 'Network error. Please check your internet connection.'
            : error.message;
          showNotification(errorMessage, 'error');
        } else {
          showNotification('An unexpected error occurred. Please try again.', 'error');
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setUser, setLoading, showNotification]
  );

  /**
   * Logout handler
   */
  const logout = useCallback((): void => {
    authService.logout();
    storeLogout();
    showNotification('You have been logged out', 'info');
    navigate('/login');
  }, [navigate, storeLogout, showNotification]);

  /**
   * Forgot password handler
   */
  const forgotPassword = useCallback(
    async (email: string): Promise<void> => {
      try {
        setLoading(true);
        await authService.forgotPassword(email);
        showNotification('Password reset link sent to your email', 'success');
      } catch (error: unknown) {
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number; data?: { error?: { message?: string }; message?: string } } };
          const status = axiosError.response?.status;
          const serverMessage = axiosError.response?.data?.error?.message || axiosError.response?.data?.message;
          
          if (status === 404) {
            errorMessage = 'No account found with this email address.';
          } else if (status && status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (serverMessage) {
            errorMessage = serverMessage;
          }
        } else if (error instanceof Error && error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        showNotification(errorMessage, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showNotification]
  );

  /**
   * Reset password handler
   */
  const resetPassword = useCallback(
    async (data: ResetPasswordData): Promise<void> => {
      try {
        setLoading(true);
        await authService.resetPassword(data);
        showNotification('Password reset successfully! Please login.', 'success');
        navigate('/login');
      } catch (error: unknown) {
        let errorMessage = 'Failed to reset password. Please try again.';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status: number; data?: { error?: { message?: string }; message?: string } } };
          const status = axiosError.response?.status;
          const serverMessage = axiosError.response?.data?.error?.message || axiosError.response?.data?.message;
          
          if (status === 400) {
            errorMessage = 'Invalid or expired reset link. Please request a new one.';
          } else if (status && status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (serverMessage) {
            errorMessage = serverMessage;
          }
        } else if (error instanceof Error && error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        showNotification(errorMessage, 'error');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading, showNotification]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };
}

export default useAuth;
