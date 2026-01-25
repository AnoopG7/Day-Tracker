import { describe, it, expect } from '@jest/globals';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema,
  updatePasswordSchema,
} from '../../../src/validations/auth.validation.js';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should pass with valid data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with short password', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with short name', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should pass with optional phone', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should pass with valid credentials', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should fail with empty password', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should pass with valid name update', () => {
      const result = updateProfileSchema.safeParse({
        name: 'New Name',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with valid phone', () => {
      const result = updateProfileSchema.safeParse({
        phone: '9876543210',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid phone format', () => {
      const result = updateProfileSchema.safeParse({
        phone: 'not-a-phone',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updatePasswordSchema', () => {
    it('should pass with valid passwords', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with short new password', () => {
      const result = updatePasswordSchema.safeParse({
        currentPassword: 'oldpassword',
        newPassword: '123',
      });
      expect(result.success).toBe(false);
    });
  });
});
