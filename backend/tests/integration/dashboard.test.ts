import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { DayLog, CustomActivity, NutritionEntry, ExpenseEntry } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('Dashboard Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  const testDate = '2026-01-25';

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('GET /api/dashboard', () => {
    it('should return empty dashboard for date with no data', async () => {
      const res = await request(app)
        .get(`/api/dashboard?date=${testDate}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.date).toBe(testDate);
      expect(res.body.data.daylog).toBeNull();
      expect(res.body.data.activities.count).toBe(0);
      expect(res.body.data.nutrition.count).toBe(0);
      expect(res.body.data.expenses.count).toBe(0);
    });

    it('should return aggregated dashboard data', async () => {
      // Create daylog
      await DayLog.create({
        userId: testUser.id,
        date: testDate,
        sleep: { duration: 480 },
        exercise: { duration: 45 },
      });

      // Create activities
      await CustomActivity.create({
        userId: testUser.id,
        date: testDate,
        name: 'reading',
        duration: 60,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: testDate,
        name: 'coding',
        duration: 120,
      });

      // Create nutrition
      await NutritionEntry.create({
        userId: testUser.id,
        date: testDate,
        mealType: 'breakfast',
        foodName: 'Oatmeal',
        calories: 300,
        protein: 10,
      });

      // Create expense
      await ExpenseEntry.create({
        userId: testUser.id,
        date: testDate,
        category: 'food',
        description: 'Lunch',
        amount: 250,
      });

      const res = await request(app)
        .get(`/api/dashboard?date=${testDate}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.date).toBe(testDate);
      
      // Check daylog
      expect(res.body.data.daylog.sleep.duration).toBe(480);
      expect(res.body.data.daylog.exercise.duration).toBe(45);
      
      // Check activities
      expect(res.body.data.activities.count).toBe(2);
      expect(res.body.data.activities.totalMinutes).toBe(180);
      
      // Check nutrition
      expect(res.body.data.nutrition.count).toBe(1);
      expect(res.body.data.nutrition.totals.calories).toBe(300);
      
      // Check expenses
      expect(res.body.data.expenses.count).toBe(1);
      expect(res.body.data.expenses.totals.total).toBe(250);
    });

    it('should default to today when no date provided', async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .get('/api/dashboard')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.date).toBe(today);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/dashboard');

      expect(res.status).toBe(401);
    });
  });
});
