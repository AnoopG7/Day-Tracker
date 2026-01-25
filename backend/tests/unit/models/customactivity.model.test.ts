import { describe, it, expect, beforeEach } from '@jest/globals';
import { CustomActivity } from '../../../src/models/customactivity.model.js';
import { DEFAULT_ACTIVITIES } from '../../../src/models/daylog.model.js';
import { User } from '../../../src/models/user.model.js';
import mongoose from 'mongoose';

describe('CustomActivity Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Activity User',
      email: `activity-${Date.now()}@test.com`,
      password: 'password123',
    });
    userId = user._id as mongoose.Types.ObjectId;
  });

  describe('Document creation', () => {
    it('should create activity with duration', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'reading',
        duration: 60,
      });

      expect(activity._id).toBeDefined();
      expect(activity.name).toBe('reading');
      expect(activity.duration).toBe(60);
    });

    it('should create activity with start/end times', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'coding',
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(activity.startTime).toBe('10:00');
      expect(activity.endTime).toBe('12:00');
    });

    it('should allow notes', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'meditation',
        duration: 20,
        notes: 'Morning session',
      });

      expect(activity.notes).toBe('Morning session');
    });
  });

  describe('Name validation', () => {
    it('should lowercase activity names', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'YOGA',
        duration: 45,
      });

      expect(activity.name).toBe('yoga');
    });

    it('should trim activity names', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: '  walking  ',
        duration: 30,
      });

      expect(activity.name).toBe('walking');
    });

    it('should reject reserved activity names', async () => {
      for (const reserved of DEFAULT_ACTIVITIES) {
        await expect(
          CustomActivity.create({
            userId,
            date: '2026-01-26',
            name: reserved,
            duration: 60,
          })
        ).rejects.toThrow();
      }
    });
  });

  describe('Unique constraint', () => {
    it('should not allow duplicate activity same date', async () => {
      await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'running',
        duration: 30,
      });

      await expect(
        CustomActivity.create({
          userId,
          date: '2026-01-25',
          name: 'running',
          duration: 45,
        })
      ).rejects.toThrow();
    });

    it('should allow same activity on different dates', async () => {
      await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'cycling',
        duration: 30,
      });

      const activity2 = await CustomActivity.create({
        userId,
        date: '2026-01-26',
        name: 'cycling',
        duration: 45,
      });

      expect(activity2).toBeDefined();
    });
  });

  describe('Required field validation', () => {
    it('should fail without name', async () => {
      await expect(
        CustomActivity.create({
          userId,
          date: '2026-01-25',
          duration: 60,
        })
      ).rejects.toThrow();
    });

    it('should fail without date', async () => {
      await expect(
        CustomActivity.create({
          userId,
          name: 'swimming',
          duration: 60,
        })
      ).rejects.toThrow();
    });
  });

  describe('Default values', () => {
    it('should set timestamps', async () => {
      const activity = await CustomActivity.create({
        userId,
        date: '2026-01-25',
        name: 'stretching',
        duration: 15,
      });

      expect(activity.createdAt).toBeDefined();
      expect(activity.updatedAt).toBeDefined();
    });
  });
});
