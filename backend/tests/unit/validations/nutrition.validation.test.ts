import { describe, it, expect } from '@jest/globals';
import {
  createNutritionSchema,
  updateNutritionSchema,
} from '../../../src/validations/nutrition.validation.js';

describe('Nutrition Validation Schemas', () => {
  describe('createNutritionSchema', () => {
    it('should pass with valid nutrition data', () => {
      const result = createNutritionSchema.safeParse({
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Oatmeal',
        calories: 300,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with all optional fields', () => {
      const result = createNutritionSchema.safeParse({
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Chicken Salad',
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 25,
        fiber: 5,
        notes: 'Healthy meal',
      });

      expect(result.success).toBe(true);
    });

    it('should fail with invalid meal type', () => {
      const result = createNutritionSchema.safeParse({
        date: '2026-01-25',
        mealType: 'brunch',
        foodName: 'Toast',
        calories: 150,
      });

      expect(result.success).toBe(false);
    });

    it('should fail without date', () => {
      const result = createNutritionSchema.safeParse({
        mealType: 'breakfast',
        foodName: 'Toast',
        calories: 150,
      });

      expect(result.success).toBe(false);
    });

    it('should pass without calories (optional field)', () => {
      const result = createNutritionSchema.safeParse({
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Toast',
      });

      expect(result.success).toBe(true);
    });

    it('should fail with negative calories', () => {
      const result = createNutritionSchema.safeParse({
        date: '2026-01-25',
        mealType: 'dinner',
        foodName: 'Food',
        calories: -100,
      });

      expect(result.success).toBe(false);
    });

    it('should fail with invalid date format', () => {
      const result = createNutritionSchema.safeParse({
        date: '25-01-2026',
        mealType: 'snack',
        foodName: 'Apple',
        calories: 95,
      });

      expect(result.success).toBe(false);
    });

    it('should accept all valid meal types', () => {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

      mealTypes.forEach(mealType => {
        const result = createNutritionSchema.safeParse({
          date: '2026-01-25',
          mealType,
          foodName: 'Food',
          calories: 100,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateNutritionSchema', () => {
    it('should pass with partial update', () => {
      const result = updateNutritionSchema.safeParse({
        calories: 350,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with multiple fields', () => {
      const result = updateNutritionSchema.safeParse({
        foodName: 'Updated Food',
        calories: 400,
        protein: 30,
      });

      expect(result.success).toBe(true);
    });

    it('should fail with invalid meal type on update', () => {
      const result = updateNutritionSchema.safeParse({
        mealType: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });
});
