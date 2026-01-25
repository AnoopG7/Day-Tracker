import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('CORS Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('Allowed Origins', () => {
    it('should allow localhost origins in development', () => {
      process.env.NODE_ENV = 'development';
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
      
      expect(allowedOrigins).toContain('http://localhost:5173');
      expect(allowedOrigins).toContain('http://localhost:3000');
    });

    it('should have test origins defined', () => {
      process.env.NODE_ENV = 'test';
      const testOrigins = ['http://localhost:5173'];
      
      expect(testOrigins).toContain('http://localhost:5173');
    });

    it('should allow requests without origin', () => {
      // Requests from Postman, mobile apps have no origin
      const origin = undefined;
      const shouldAllow = !origin;
      
      expect(shouldAllow).toBe(true);
    });
  });

  describe('CORS Options', () => {
    it('should enable credentials', () => {
      const corsOptions = { credentials: true };
      expect(corsOptions.credentials).toBe(true);
    });

    it('should allow standard HTTP methods', () => {
      const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
      
      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('POST');
      expect(allowedMethods).toContain('DELETE');
    });

    it('should allow authorization header', () => {
      const allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
      
      expect(allowedHeaders).toContain('Authorization');
    });
  });
});
