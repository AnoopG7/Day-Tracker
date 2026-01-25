import { describe, it, expect } from '@jest/globals';
import { hashPassword, comparePassword } from '../../../src/utils/password.util.js';

describe('Password Utility', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50); // bcrypt hashes are 60 chars
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle empty string password', async () => {
      const hashed = await hashPassword('');
      expect(hashed).toBeDefined();
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should handle special characters in password', async () => {
      const password = 'p@$$w0rd!#$%^&*()';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });

    it('should handle very long passwords', async () => {
      const password = 'a'.repeat(1000);
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword(password, hashed);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword('wrongPassword', hashed);
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword('', hashed);
      expect(isMatch).toBe(false);
    });

    it('should handle comparison with special characters', async () => {
      const password = 'p@$$w0rd!#$%^&*()';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword(password, hashed);
      expect(isMatch).toBe(true);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);

      const isMatch = await comparePassword('testpassword123', hashed);
      expect(isMatch).toBe(false);
    });
  });
});
