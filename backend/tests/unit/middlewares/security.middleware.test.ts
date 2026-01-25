import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  globalRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  securityHeaders,
} from '../../../src/middlewares/security.middleware.js';

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    
    mockReq = {
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '127.0.0.1',
      } as any,
    };

    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('securityHeaders', () => {
    it('should set X-Content-Type-Options header', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should set X-Frame-Options header', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('should set X-XSS-Protection header', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set Referrer-Policy header', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });

    it('should set Content-Security-Policy header', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "default-src 'self'");
    });

    it('should call next()', () => {
      securityHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Rate Limiters (non-test environment)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    describe('globalRateLimiter', () => {
      it('should set rate limit headers', () => {
        globalRateLimiter(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
      });

      it('should allow first request', () => {
        const req = { ...mockReq, ip: '192.168.1.1' };
        globalRateLimiter(req as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalledWith(429);
      });

      it('should track requests per IP', () => {
        const req = { ...mockReq, ip: '192.168.1.2' };
        
        // First request
        globalRateLimiter(req as Request, mockRes as Response, mockNext);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 99);
        
        // Second request
        globalRateLimiter(req as Request, mockRes as Response, mockNext);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 98);
      });

      it('should use remoteAddress if no IP', () => {
        const req = { ...mockReq };
        delete req.ip;
        
        globalRateLimiter(req as Request, mockRes as Response, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle unknown IP', () => {
        const req = { socket: {} as any };
        
        globalRateLimiter(req as Request, mockRes as Response, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('authRateLimiter', () => {
      it('should have stricter limit (10 requests)', () => {
        authRateLimiter(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      });

      it('should return error when limit exceeded', () => {
        const req = { ...mockReq, ip: '10.0.0.1' };
        
        // Make 11 requests (limit is 10)
        for (let i = 0; i < 11; i++) {
          authRateLimiter(req as Request, mockRes as Response, mockNext);
        }

        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Too many authentication attempts, please try again later',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
          },
        });
      });
    });

    describe('passwordResetRateLimiter', () => {
      it('should have strictest limit (5 requests)', () => {
        passwordResetRateLimiter(mockReq as Request, mockRes as Response, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      });

      it('should return error when limit exceeded', () => {
        const req = { ...mockReq, ip: '10.0.0.2' };
        
        // Make 6 requests (limit is 5)
        for (let i = 0; i < 6; i++) {
          passwordResetRateLimiter(req as Request, mockRes as Response, mockNext);
        }

        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Too many password reset attempts, please try again later',
            code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
          },
        });
      });
    });
  });

  describe('Rate Limiters in test environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should skip rate limiting in test environment', () => {
      globalRateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('authRateLimiter should skip in test environment', () => {
      authRateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it('passwordResetRateLimiter should skip in test environment', () => {
      passwordResetRateLimiter(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });
  });
});
