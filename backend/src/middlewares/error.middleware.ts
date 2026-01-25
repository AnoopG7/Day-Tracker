import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors.js';

interface ErrorResponse {
  success: boolean;
  error: {
    message: string;
    code?: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Enhanced Global Error Handler
 */
export const errorHandler = (
  err: Error & { code?: number; keyValue?: Record<string, unknown>; path?: string; value?: unknown; errors?: Record<string, { message: string }> },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000 || err.code === 11001) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];

    const response: ErrorResponse = {
      success: false,
      error: {
        message: `Duplicate value for field: ${field}`,
        code: 'DUPLICATE_KEY',
        details: { field, value },
      },
    };

    res.status(409).json(response);
    return;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: `Invalid ${err.path}: ${err.value}`,
        code: 'INVALID_ID',
        details: { path: err.path, value: err.value },
      },
    };

    res.status(400).json(response);
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    const errors: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors![key].message;
    });

    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    };

    res.status(400).json(response);
    return;
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      response.error.stack = err.stack;
    }

    res.status(err.status).json(response);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    };

    res.status(401).json(response);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      },
    };

    res.status(401).json(response);
    return;
  }

  // Unexpected/Unknown Error
  const response: ErrorResponse = {
    success: false,
    error: {
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = { name: err.name, message: err.message };
  }

  res.status(500).json(response);
};

/**
 * 404 Not Found Handler
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};
