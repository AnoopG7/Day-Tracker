import { describe, it, expect, beforeEach } from '@jest/globals';
import { NutritionEntry } from '../../../src/models/nutrition.model.js';
import { User } from '../../../src/models/user.model.js';
import mongoose from 'mongoose';

describe('NutritionEntry Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Nutrition User',
      email: `nutrition-${Date.now()}@test.com`,
      password: 'password123',
    });
    userId = user._id as mongoose.Types.ObjectId;
  });

  describe('Document creation', () => {
    it('should create nutrition entry with required fields', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Oatmeal',
        calories: 300,
      });

      expect(entry._id).toBeDefined();
      expect(entry.mealType).toBe('breakfast');
      expect(entry.foodName).toBe('oatmeal'); // lowercase
      expect(entry.calories).toBe(300);
    });

    it('should create entry with macro data', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Chicken Salad',
        calories: 450,
        protein: 35,
        carbs: 20,
        fats: 25,
        fiber: 5,
      });

      expect(entry.protein).toBe(35);
      expect(entry.carbs).toBe(20);
      expect(entry.fats).toBe(25);
      expect(entry.fiber).toBe(5);
    });
  });

  describe('Meal type validation', () => {
    it('should accept valid meal types', async () => {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

      for (const mealType of mealTypes) {
        const entry = await NutritionEntry.create({
          userId,
          date: '2026-01-25',
          mealType,
          foodName: `${mealType} food`,
          calories: 100,
        });
        expect(entry.mealType).toBe(mealType);
      }
    });

    it('should reject invalid meal type', async () => {
      await expect(
        NutritionEntry.create({
          userId,
          date: '2026-01-25',
          mealType: 'brunch',
          foodName: 'Food',
          calories: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe('Default values', () => {
    it('should default optional macros to undefined', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'snack',
        foodName: 'Apple',
        calories: 95,
      });

      expect(entry.protein).toBeUndefined();
      expect(entry.carbs).toBeUndefined();
    });

    it('should set source to manual by default', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Toast',
        calories: 150,
      });

      expect(entry.source).toBe('manual');
    });
  });

  describe('Required field validation', () => {
    it('should pass without calories (optional)', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Salad',
      });

      expect(entry.calories).toBeUndefined();
    });

    it('should fail without foodName', async () => {
      await expect(
        NutritionEntry.create({
          userId,
          date: '2026-01-25',
          mealType: 'lunch',
          calories: 300,
        })
      ).rejects.toThrow();
    });
  });

  describe('Food name normalization', () => {
    it('should trim and lowercase food name', async () => {
      const entry = await NutritionEntry.create({
        userId,
        date: '2026-01-25',
        mealType: 'dinner',
        foodName: '  GRILLED CHICKEN  ',
        calories: 350,
      });

      expect(entry.foodName).toBe('grilled chicken');
    });
  });
});
