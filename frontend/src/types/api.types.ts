/** API-related TypeScript types */

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/** API error response */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

/** Field-level validation error */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** HTTP methods */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Request config for API calls */
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/** Auth tokens */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request payload */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Auth response with user and tokens */
export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

/** User response from API */
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
