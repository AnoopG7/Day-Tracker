import { describe, it, expect, beforeEach } from '@jest/globals';
import { User, IUser } from '../../../src/models/user.model.js';

describe('User Model', () => {
  describe('Document creation', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.isActive).toBe(true);
    });

    it('should lowercase email automatically', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(user.email).toBe('test@example.com');
    });

    it('should trim name and email', async () => {
      const user = await User.create({
        name: '  John Doe  ',
        email: '  john2@example.com  ',
        password: 'password123',
      });

      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john2@example.com');
    });

    it('should set default values correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test3@example.com',
        password: 'password123',
      });

      expect(user.isActive).toBe(true);
      expect(user.avatar).toBeNull();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('Required field validation', () => {
    it('should fail without name', async () => {
      await expect(
        User.create({
          email: 'noname@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(/Name is required/);
    });

    it('should fail without email', async () => {
      await expect(
        User.create({
          name: 'No Email',
          password: 'password123',
        })
      ).rejects.toThrow(/Email is required/);
    });

    it('should fail without password', async () => {
      await expect(
        User.create({
          name: 'No Password',
          email: 'nopass@example.com',
        })
      ).rejects.toThrow(/Password is required/);
    });
  });

  describe('Field validation', () => {
    it('should fail with invalid email format', async () => {
      await expect(
        User.create({
          name: 'Invalid Email',
          email: 'not-an-email',
          password: 'password123',
        })
      ).rejects.toThrow(/valid email/);
    });

    it('should fail with short name', async () => {
      await expect(
        User.create({
          name: 'A',
          email: 'shortname@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(/at least 2 characters/);
    });

    it('should fail with short password', async () => {
      await expect(
        User.create({
          name: 'Short Pass',
          email: 'shortpass@example.com',
          password: '12345',
        })
      ).rejects.toThrow(/at least 6 characters/);
    });

    it('should fail with invalid phone format', async () => {
      await expect(
        User.create({
          name: 'Bad Phone',
          email: 'badphone@example.com',
          password: 'password123',
          phone: 'not-a-phone',
        })
      ).rejects.toThrow(/valid phone/);
    });

    it('should accept valid phone number', async () => {
      const user = await User.create({
        name: 'Good Phone',
        email: 'goodphone@example.com',
        password: 'password123',
        phone: '1234567890',
      });

      expect(user.phone).toBe('1234567890');
    });
  });

  describe('Password hashing (pre-save hook)', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        name: 'Hash Test',
        email: 'hash@example.com',
        password: plainPassword,
      });

      // Get user with password
      const userWithPassword = await User.findById(user._id).select('+password');
      
      expect(userWithPassword?.password).not.toBe(plainPassword);
      expect(userWithPassword?.password?.length).toBeGreaterThan(50);
    });

    it('should not expose password by default', async () => {
      await User.create({
        name: 'No Password Expose',
        email: 'noexpose@example.com',
        password: 'password123',
      });

      const user = await User.findOne({ email: 'noexpose@example.com' });
      expect(user?.password).toBeUndefined();
    });
  });

  describe('comparePassword method', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'password123';
      const user = await User.create({
        name: 'Compare Test',
        email: 'compare@example.com',
        password: plainPassword,
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword?.comparePassword(plainPassword);

      expect(isMatch).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const user = await User.create({
        name: 'Wrong Pass',
        email: 'wrongpass@example.com',
        password: 'correctpassword',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword?.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('Unique constraints', () => {
    it('should not allow duplicate emails', async () => {
      await User.create({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      await expect(
        User.create({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
        })
      ).rejects.toThrow();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt', async () => {
      const user = await User.create({
        name: 'Timestamp Test',
        email: 'timestamp@example.com',
        password: 'password123',
      });

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const user = await User.create({
        name: 'Update Test',
        email: 'updatetest@example.com',
        password: 'password123',
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 100));
      user.name = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
