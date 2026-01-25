import { describe, it, expect } from '@jest/globals';
import { 
  createDayLogSchema, 
  updateDayLogSchema,
  dateParamSchema,
} from '../../../src/validations/daylog.validation.js';

describe('DayLog Validation Schemas', () => {
  describe('createDayLogSchema', () => {
    it('should pass with valid date and sleep duration', () => {
      const result = createDayLogSchema.safeParse({
        date: '2026-01-25',
        sleep: { duration: 480 },
      });
      expect(result.success).toBe(true);
    });

    it('should pass with sleep start/end times', () => {
      const result = createDayLogSchema.safeParse({
        date: '2026-01-25',
        sleep: { startTime: '23:00', endTime: '07:00' },
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid date format', () => {
      const result = createDayLogSchema.safeParse({
        date: '25-01-2026',
        sleep: { duration: 480 },
      });
      expect(result.success).toBe(false);
    });

    it('should pass with exercise duration', () => {
      const result = createDayLogSchema.safeParse({
        date: '2026-01-25',
        exercise: { duration: 45 },
      });
      expect(result.success).toBe(true);
    });

    it('should fail with negative duration', () => {
      const result = createDayLogSchema.safeParse({
        date: '2026-01-25',
        sleep: { duration: -100 },
      });
      expect(result.success).toBe(false);
    });

    it('should pass with notes', () => {
      const result = createDayLogSchema.safeParse({
        date: '2026-01-25',
        notes: 'Had a great day!',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('updateDayLogSchema', () => {
    it('should pass with partial update', () => {
      const result = updateDayLogSchema.safeParse({
        sleep: { duration: 500 },
      });
      expect(result.success).toBe(true);
    });

    it('should pass with empty object', () => {
      const result = updateDayLogSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('dateParamSchema', () => {
    it('should pass with valid date', () => {
      const result = dateParamSchema.safeParse({
        date: '2026-01-25',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid date format', () => {
      const result = dateParamSchema.safeParse({
        date: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
