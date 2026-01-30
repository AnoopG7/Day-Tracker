import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, ApiErrorResponse } from '../types/api.types';

/** API base URL from environment or fallback */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 10000;

/** Storage keys */
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/** Create axios instance with default config */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Add auth token to requests */
function addAuthToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

/** Handle request errors */
function handleRequestError(error: AxiosError): Promise<never> {
  return Promise.reject(error);
}

/** Handle successful responses */
function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): AxiosResponse<ApiResponse<T>> {
  return response;
}

/** Handle response errors */
function handleResponseError(error: AxiosError<ApiErrorResponse>): Promise<never> {
  if (error.response?.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Only redirect if not already on auth page
    const currentPath = window.location.pathname;
    if (
      !currentPath.startsWith('/login') &&
      !currentPath.startsWith('/register') &&
      !currentPath.startsWith('/forgot-password') &&
      !currentPath.startsWith('/reset-password')
    ) {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
}

// Request interceptor
api.interceptors.request.use(addAuthToken, handleRequestError);

// Response interceptor
api.interceptors.response.use(handleResponse, handleResponseError);

export default api;
