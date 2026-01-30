import api from './api';
import type { ApiResponse } from '../types/api.types';
import type { User } from '../types/user.types';

/** Auth response with tokens */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Registration data */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

/** Password reset data */
export interface ResetPasswordData {
  token: string;
  password: string;
}

/** Storage keys */
const TOKEN_KEY = 'accessToken';

/** Auth API service */
export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { token, user } = response.data.data;

    // Store token
    localStorage.setItem(TOKEN_KEY, token);

    return { token, user };
  },

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { token, user } = response.data.data;

    // Store token
    localStorage.setItem(TOKEN_KEY, token);

    return { token, user };
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Logout - clear tokens
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
