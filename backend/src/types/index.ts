import { Request } from 'express';
import { Types } from 'mongoose';

// ============================================
// Auth Types
// ============================================

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Query Types
// ============================================

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface DateRangeQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
}

// ============================================
// MongoDB Types
// ============================================

export type ObjectId = Types.ObjectId;
