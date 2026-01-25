import { describe, it, expect, beforeEach } from '@jest/globals';
import { DayLog } from '../../../src/models/daylog.model.js';
import { User } from '../../../src/models/user.model.js';
import mongoose from 'mongoose';

describe('DayLog Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: `daylog-${Date.now()}@test.com`,
      password: 'password123',
    });
    userId = user._id as mongoose.Types.ObjectId;
  });

  describe('Document creation', () => {
    it('should create daylog with required fields', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
      });

      expect(daylog._id).toBeDefined();
      expect(daylog.userId.toString()).toBe(userId.toString());
      expect(daylog.date).toBe('2026-01-25');
    });

    it('should create daylog with sleep duration', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
        sleep: {
          duration: 480,
        },
      });

      expect(daylog.sleep?.duration).toBe(480);
    });

    it('should create daylog with exercise duration', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
        exercise: {
          duration: 45,
        },
      });

      expect(daylog.exercise?.duration).toBe(45);
    });

    it('should allow notes field', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
        notes: 'Great day!',
      });

      expect(daylog.notes).toBe('Great day!');
    });
  });

  describe('Default values', () => {
    it('should set createdAt and updatedAt', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
      });

      expect(daylog.createdAt).toBeDefined();
      expect(daylog.updatedAt).toBeDefined();
    });
  });

  describe('Required field validation', () => {
    it('should fail without userId', async () => {
      await expect(
        DayLog.create({
          date: '2026-01-25',
        })
      ).rejects.toThrow();
    });

    it('should fail without date', async () => {
      await expect(
        DayLog.create({
          userId,
        })
      ).rejects.toThrow();
    });
  });

  describe('Unique constraint', () => {
    it('should not allow duplicate date for same user', async () => {
      await DayLog.create({
        userId,
        date: '2026-01-25',
      });

      await expect(
        DayLog.create({
          userId,
          date: '2026-01-25',
        })
      ).rejects.toThrow();
    });

    it('should allow same date for different users', async () => {
      const user2 = await User.create({
        name: 'User 2',
        email: `daylog2-${Date.now()}@test.com`,
        password: 'password123',
      });

      await DayLog.create({ userId, date: '2026-01-25' });
      const daylog2 = await DayLog.create({
        userId: user2._id,
        date: '2026-01-25',
      });

      expect(daylog2).toBeDefined();
    });
  });

  describe('Data types', () => {
    it('should validate sleep duration', async () => {
      const daylog = await DayLog.create({
        userId,
        date: '2026-01-25',
        sleep: { duration: 480 },
      });

      expect(daylog.sleep?.duration).toBe(480);
    });
  });
});
