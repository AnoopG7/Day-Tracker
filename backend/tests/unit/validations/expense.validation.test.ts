import { describe, it, expect } from '@jest/globals';
import { 
  createExpenseSchema,
  updateExpenseSchema,
} from '../../../src/validations/expense.validation.js';

describe('Expense Validation Schemas', () => {
  describe('createExpenseSchema', () => {
    it('should pass with valid expense data', () => {
      const result = createExpenseSchema.safeParse({
        date: '2026-01-25',
        category: 'food',
        description: 'Lunch at cafe',
        amount: 250,
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid category', () => {
      const result = createExpenseSchema.safeParse({
        date: '2026-01-25',
        category: 'invalid-category',
        description: 'Test',
        amount: 100,
      });
      expect(result.success).toBe(false);
    });

    it('should fail with negative amount', () => {
      const result = createExpenseSchema.safeParse({
        date: '2026-01-25',
        category: 'food',
        description: 'Test',
        amount: -50,
      });
      expect(result.success).toBe(false);
    });

    it('should pass with all categories', () => {
      const categories = [
        'food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'other'
      ];

      categories.forEach(category => {
        const result = createExpenseSchema.safeParse({
          date: '2026-01-25',
          category,
          description: 'Test',
          amount: 100,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should fail with empty description', () => {
      const result = createExpenseSchema.safeParse({
        date: '2026-01-25',
        category: 'food',
        description: '',
        amount: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateExpenseSchema', () => {
    it('should pass with partial update', () => {
      const result = updateExpenseSchema.safeParse({
        amount: 300,
      });
      expect(result.success).toBe(true);
    });

    it('should fail with invalid category on update', () => {
      const result = updateExpenseSchema.safeParse({
        category: 'not-a-category',
      });
      expect(result.success).toBe(false);
    });
  });
});
