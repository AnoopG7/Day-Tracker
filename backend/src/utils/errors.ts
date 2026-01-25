/**
 * Custom API Error Classes
 * Provides type-safe, structured error handling across the application
 */

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status = 500,
    message = 'Internal Server Error',
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code || 'API_ERROR';
    this.details = details;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

/**
 * 400 Bad Request Error
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details?: unknown) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict', details?: unknown) {
    super(409, message, 'CONFLICT', details);
  }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized - Authentication required') {
    super(401, message, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden - Insufficient permissions') {
    super(403, message, 'FORBIDDEN');
  }
}

/**
 * 422 Unprocessable Entity Error
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
  }
}
