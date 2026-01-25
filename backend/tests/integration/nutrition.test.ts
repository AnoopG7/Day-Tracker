import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { NutritionEntry } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('Nutrition Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('POST /api/nutrition', () => {
    it('should create nutrition entry', async () => {
      const res = await request(app)
        .post('/api/nutrition')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          mealType: 'breakfast',
          foodName: 'Oatmeal',
          calories: 300,
          protein: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.foodName).toBe('oatmeal');
    });

    it('should fail with invalid mealType', async () => {
      const res = await request(app)
        .post('/api/nutrition')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          mealType: 'invalid',
          foodName: 'Test',
          calories: 100,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/nutrition', () => {
    it('should get nutrition entries with pagination', async () => {
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Toast',
        calories: 200,
      });

      const res = await request(app)
        .get('/api/nutrition')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.entries).toHaveLength(1);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by date', async () => {
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Salad',
        calories: 350,
      });

      const res = await request(app)
        .get('/api/nutrition?date=2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.entries).toHaveLength(1);
    });
  });

  describe('GET /api/nutrition/summary/daily', () => {
    it('should return daily nutrition totals', async () => {
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Eggs',
        calories: 200,
        protein: 15,
      });

      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Chicken',
        calories: 400,
        protein: 35,
      });

      const res = await request(app)
        .get('/api/nutrition/summary/daily?date=2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.totalCalories).toBe(600);
      expect(res.body.data.totalProtein).toBe(50);
    });
  });

  describe('PUT /api/nutrition/:id', () => {
    it('should update nutrition entry', async () => {
      const entry = await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'breakfast',
        foodName: 'Toast',
        calories: 200,
      });

      const res = await request(app)
        .put(`/api/nutrition/${entry._id}`)
        .set(authHeader(testUser.token))
        .send({ calories: 250 });

      expect(res.status).toBe(200);
      expect(res.body.data.calories).toBe(250);
    });
  });

  describe('DELETE /api/nutrition/:id', () => {
    it('should delete nutrition entry', async () => {
      const entry = await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'dinner',
        foodName: 'Pasta',
        calories: 500,
      });

      const res = await request(app)
        .delete(`/api/nutrition/${entry._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/nutrition/:id', () => {
    it('should get single nutrition entry', async () => {
      const entry = await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'snack',
        foodName: 'Apple',
        calories: 95,
      });

      const res = await request(app)
        .get(`/api/nutrition/${entry._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.foodName).toBe('apple');
    });

    it('should return 404 for non-existent entry', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/nutrition/${fakeId}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/nutrition with filters', () => {
    beforeEach(async () => {
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-20',
        mealType: 'breakfast',
        foodName: 'Cereal',
        calories: 250,
      });
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        mealType: 'lunch',
        foodName: 'Burger',
        calories: 600,
      });
      await NutritionEntry.create({
        userId: testUser.id,
        date: '2026-01-26',
        mealType: 'breakfast',
        foodName: 'Pancakes',
        calories: 400,
      });
    });

    it('should filter by mealType', async () => {
      const res = await request(app)
        .get('/api/nutrition?mealType=breakfast')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.entries.length).toBe(2);
      expect(res.body.data.entries.every((e: any) => e.mealType === 'breakfast')).toBe(true);
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/nutrition?startDate=2026-01-25&endDate=2026-01-26')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.entries.length).toBe(2);
    });
  });

  describe('GET /api/nutrition/summary/weekly', () => {
    beforeEach(async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      await NutritionEntry.create({
        userId: testUser.id,
        date: today,
        mealType: 'breakfast',
        foodName: 'Eggs',
        calories: 200,
        protein: 15,
      });

      await NutritionEntry.create({
        userId: testUser.id,
        date: yesterday,
        mealType: 'lunch',
        foodName: 'Chicken',
        calories: 400,
        protein: 40,
      });
    });

    it('should return weekly summary with averages', async () => {
      const res = await request(app)
        .get('/api/nutrition/summary/weekly')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.period).toBeDefined();
      expect(res.body.data.totalEntries).toBe(2);
      expect(res.body.data.daysWithData).toBe(2);
      expect(res.body.data.totals.calories).toBe(600);
      expect(res.body.data.totals.protein).toBe(55);
      expect(res.body.data.averages).toBeDefined();
      expect(res.body.data.dailyBreakdown).toBeDefined();
    });
  });
});
