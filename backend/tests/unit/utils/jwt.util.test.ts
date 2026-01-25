import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateToken, verifyToken } from '../../../src/utils/jwt.util.js';

describe('JWT Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRE = '1h';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken('user123', 'test@example.com', 'user');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate token with only userId', () => {
      const token = generateToken('user123');

      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3);
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken('user1', 'user1@test.com');
      const token2 = generateToken('user2', 'user2@test.com');

      expect(token1).not.toBe(token2);
    });

    it('should include userId in token payload', () => {
      const userId = 'user123';
      const token = generateToken(userId, 'test@example.com');

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
    });

    it('should include email in token payload', () => {
      const email = 'test@example.com';
      const token = generateToken('user123', email);

      const decoded = verifyToken(token);
      expect(decoded.email).toBe(email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken('user123', 'test@example.com', 'admin');

      const decoded = verifyToken(token);

      expect(decoded.userId).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('admin');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyToken('abc.def.ghi');
      }).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });

    it('should throw error for token signed with different secret', () => {
      const token = generateToken('user123', 'test@example.com');
      
      // Change secret
      process.env.JWT_SECRET = 'different-secret';

      expect(() => {
        verifyToken(token);
      }).toThrow('Invalid or expired token');
    });

    it('should include iat (issued at) in decoded token', () => {
      const token = generateToken('user123', 'test@example.com');

      const decoded = verifyToken(token);

      expect(decoded.iat).toBeDefined();
      expect(typeof decoded.iat).toBe('number');
    });

    it('should include exp (expiration) in decoded token', () => {
      const token = generateToken('user123', 'test@example.com');

      const decoded = verifyToken(token);

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
      expect(decoded.exp).toBeGreaterThan(decoded.iat!);
    });
  });
});
