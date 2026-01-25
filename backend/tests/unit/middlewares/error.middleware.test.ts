import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, notFound } from '../../../src/middlewares/error.middleware.js';
import { ApiError, NotFoundError, BadRequestError } from '../../../src/utils/errors.js';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();

    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle ApiError', () => {
      const error = new BadRequestError('Test bad request');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Test bad request',
            code: 'BAD_REQUEST',
          }),
        })
      );
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('User not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'User not found',
          }),
        })
      );
    });

    it('should handle MongoDB duplicate key error', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: { email: 'test@example.com' },
        message: 'Duplicate key error',
      } as Error & { code: number; keyValue: Record<string, unknown> };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'DUPLICATE_KEY',
          }),
        })
      );
    });

    it('should handle CastError (invalid ObjectId)', () => {
      const error = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id',
        message: 'Cast error',
      } as Error & { path: string; value: unknown };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_ID',
          }),
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          password: { message: 'Password is required' },
        },
        message: 'Validation Error',
      } as Error & { errors: Record<string, { message: string }> };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: {
              email: 'Email is required',
              password: 'Password is required',
            },
          }),
        })
      );
    });

    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      } as Error;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INVALID_TOKEN',
          }),
        })
      );
    });

    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      } as Error;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'TOKEN_EXPIRED',
          }),
        })
      );
    });

    it('should handle unknown errors with 500', () => {
      const error = new Error('Unknown error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        })
      );
    });

    it('should include stack in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new ApiError(500, 'Error with stack');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: expect.any(String),
          }),
        })
      );
    });
  });

  describe('notFound', () => {
    it('should return 404 with route info', () => {
      mockReq.method = 'POST';
      mockReq.originalUrl = '/api/unknown';

      notFound(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Route POST /api/unknown not found',
          code: 'ROUTE_NOT_FOUND',
        },
      });
    });
  });
});
