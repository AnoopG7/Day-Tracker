import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../../../src/middlewares/auth.middleware.js';
import { generateToken } from '../../../src/utils/jwt.util.js';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRE = '1h';

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should pass with valid token', async () => {
      const token = generateToken('user123', 'test@example.com', 'user');
      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('user123');
      expect(mockReq.user?.email).toBe('test@example.com');
    });

    it('should fail without authorization header', async () => {
      mockReq.headers = {};

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided. Please login.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail without Bearer prefix', async () => {
      const token = generateToken('user123', 'test@example.com');
      mockReq.headers = { authorization: token };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'No token provided. Please login.',
      });
    });

    it('should fail with invalid token', async () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token. Please login again.',
      });
    });

    it('should fail with wrong secret token', async () => {
      const token = generateToken('user123', 'test@example.com');
      process.env.JWT_SECRET = 'different-secret';
      mockReq.headers = { authorization: `Bearer ${token}` };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should fail with empty Bearer token', async () => {
      mockReq.headers = { authorization: 'Bearer ' };

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize', () => {
    it('should pass with correct role', () => {
      mockReq.user = { userId: 'user123', email: 'test@test.com', role: 'admin' };
      const middleware = authorize('admin', 'superadmin');

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail without user', () => {
      const middleware = authorize('admin');

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Not authenticated',
      });
    });

    it('should fail with incorrect role', () => {
      mockReq.user = { userId: 'user123', email: 'test@test.com', role: 'user' };
      const middleware = authorize('admin');

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    });

    it('should accept multiple roles', () => {
      mockReq.user = { userId: 'user123', email: 'test@test.com', role: 'moderator' };
      const middleware = authorize('admin', 'moderator', 'user');

      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
