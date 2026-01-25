import { describe, it, expect } from '@jest/globals';
import {
  ApiError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  InternalServerError,
} from '../../../src/utils/errors.js';

describe('Custom Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with default values', () => {
      const error = new ApiError();

      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal Server Error');
      expect(error.code).toBe('API_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('should create error with custom values', () => {
      const error = new ApiError(418, 'I am a teapot', 'TEAPOT', { brew: 'coffee' });

      expect(error.status).toBe(418);
      expect(error.message).toBe('I am a teapot');
      expect(error.code).toBe('TEAPOT');
      expect(error.details).toEqual({ brew: 'coffee' });
    });

    it('should be instance of Error', () => {
      const error = new ApiError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with default message', () => {
      const error = new NotFoundError();

      expect(error.status).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create 404 error with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.status).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should be instance of ApiError', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error with default message', () => {
      const error = new BadRequestError();

      expect(error.status).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should create 400 error with details', () => {
      const details = { field: 'email', error: 'Invalid format' };
      const error = new BadRequestError('Validation failed', details);

      expect(error.status).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('ConflictError', () => {
    it('should create 409 error', () => {
      const error = new ConflictError('Email already exists');

      expect(error.status).toBe(409);
      expect(error.message).toBe('Email already exists');
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error with default message', () => {
      const error = new UnauthorizedError();

      expect(error.status).toBe(401);
      expect(error.message).toBe('Unauthorized - Authentication required');
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create 401 error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.status).toBe(401);
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('ForbiddenError', () => {
    it('should create 403 error', () => {
      const error = new ForbiddenError();

      expect(error.status).toBe(403);
      expect(error.message).toBe('Forbidden - Insufficient permissions');
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('ValidationError', () => {
    it('should create 422 error', () => {
      const validationDetails = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', validationDetails);

      expect(error.status).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(validationDetails);
    });
  });

  describe('InternalServerError', () => {
    it('should create 500 error', () => {
      const error = new InternalServerError();

      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should include error details', () => {
      const error = new InternalServerError('Database connection failed', { host: 'localhost' });

      expect(error.details).toEqual({ host: 'localhost' });
    });
  });

  describe('Error hierarchy', () => {
    it('all custom errors should extend ApiError', () => {
      const errors = [
        new NotFoundError(),
        new BadRequestError(),
        new ConflictError(),
        new UnauthorizedError(),
        new ForbiddenError(),
        new ValidationError(),
        new InternalServerError(),
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('errors should be throwable and catchable', () => {
      const throwError = () => {
        throw new NotFoundError('Test error');
      };

      expect(throwError).toThrow(NotFoundError);
      expect(throwError).toThrow('Test error');
    });
  });
});
