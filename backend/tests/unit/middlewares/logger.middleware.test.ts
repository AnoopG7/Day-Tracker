import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../../../src/middlewares/logger.middleware.js';

describe('Logger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let eventHandlers: Record<string, Function>;

  beforeEach(() => {
    eventHandlers = {};

    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };

    mockRes = {
      statusCode: 200,
      on: jest.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
        return mockRes as Response;
      }),
    };

    mockNext = jest.fn();
  });

  describe('Production environment', () => {
    it('should skip logging in production without ENABLE_REQUEST_LOGGING', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      delete process.env.ENABLE_REQUEST_LOGGING;

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should log in production when ENABLE_REQUEST_LOGGING is set', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalLogging = process.env.ENABLE_REQUEST_LOGGING;
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_REQUEST_LOGGING = 'true';

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));

      process.env.NODE_ENV = originalEnv;
      if (originalLogging === undefined) {
        delete process.env.ENABLE_REQUEST_LOGGING;
      } else {
        process.env.ENABLE_REQUEST_LOGGING = originalLogging;
      }
    });
  });

  describe('Development environment', () => {
    beforeEach(() => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
    });

    it('should register finish event listener in development', () => {
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log successful request (status < 400)', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockRes.statusCode = 200;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the finish event
      eventHandlers['finish']();

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/test');
      expect(logCall).toContain('200');

      consoleLogSpy.mockRestore();
    });

    it('should log error request (status >= 400)', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockRes.statusCode = 404;
      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      // Trigger the finish event
      eventHandlers['finish']();

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0] as string;
      expect(logCall).toContain('GET');
      expect(logCall).toContain('/api/test');
      expect(logCall).toContain('404');

      consoleLogSpy.mockRestore();
    });

    it('should include request duration in log', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      requestLogger(mockReq as Request, mockRes as Response, mockNext);

      // Simulate some delay
      setTimeout(() => {
        eventHandlers['finish']();
      }, 10);

      // Wait for async completion
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(consoleLogSpy).toHaveBeenCalled();
          const logCall = consoleLogSpy.mock.calls[0][0] as string;
          expect(logCall).toContain('ms');
          consoleLogSpy.mockRestore();
          resolve(undefined);
        }, 50);
      });
    });
  });
});
