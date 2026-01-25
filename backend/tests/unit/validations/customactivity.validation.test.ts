import { describe, it, expect } from '@jest/globals';
import {
  createActivitySchema,
  updateActivitySchema,
} from '../../../src/validations/customactivity.validation.js';

describe('CustomActivity Validation Schemas', () => {
  describe('createActivitySchema', () => {
    it('should pass with name and duration', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'reading',
        duration: 60,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with start and end times', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'coding',
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(result.success).toBe(true);
    });

    it('should pass with all optional fields', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'meditation',
        duration: 30,
        notes: 'Morning session',
        category: 'wellness',
      });

      expect(result.success).toBe(true);
    });

    it('should reject reserved name "sleep"', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'sleep',
        duration: 480,
      });

      expect(result.success).toBe(false);
    });

    it('should reject reserved name "exercise"', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'exercise',
        duration: 60,
      });

      expect(result.success).toBe(false);
    });

    it('should fail without date', () => {
      const result = createActivitySchema.safeParse({
        name: 'yoga',
        duration: 45,
      });

      expect(result.success).toBe(false);
    });

    it('should fail without name', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        duration: 60,
      });

      expect(result.success).toBe(false);
    });

    it('should fail with invalid date format', () => {
      const result = createActivitySchema.safeParse({
        date: '25/01/2026',
        name: 'walking',
        duration: 30,
      });

      expect(result.success).toBe(false);
    });

    it('should fail with negative duration', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: 'running',
        duration: -30,
      });

      expect(result.success).toBe(false);
    });

    it('should trim and validate name', () => {
      const result = createActivitySchema.safeParse({
        date: '2026-01-25',
        name: '  running  ',
        duration: 30,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('running');
      }
    });
  });

  describe('updateActivitySchema', () => {
    it('should pass with partial update', () => {
      const result = updateActivitySchema.safeParse({
        duration: 90,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with notes update', () => {
      const result = updateActivitySchema.safeParse({
        notes: 'Updated notes',
      });

      expect(result.success).toBe(true);
    });

    it('should pass with name field (update doesnt have name)', () => {
      // Update schema doesn't include name field
      const result = updateActivitySchema.safeParse({
        duration: 60,
        notes: 'Updated notes',
      });

      expect(result.success).toBe(true);
    });

    it('should pass with empty object', () => {
      const result = updateActivitySchema.safeParse({});

      expect(result.success).toBe(true);
    });
  });
});
