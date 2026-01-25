import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { DayLog } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('DayLog Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('GET /api/daylogs', () => {
    it('should get all daylogs with pagination', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      await DayLog.create({
        userId: testUser.id,
        date: today,
        sleep: { duration: 480 },
      });

      await DayLog.create({
        userId: testUser.id,
        date: yesterday,
        sleep: { duration: 420 },
      });

      const res = await request(app)
        .get('/api/daylogs')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.daylogs).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by date range', async () => {
      await DayLog.create({
        userId: testUser.id,
        date: '2026-01-20',
        sleep: { duration: 480 },
      });

      await DayLog.create({
        userId: testUser.id,
        date: '2026-01-25',
        sleep: { duration: 420 },
      });

      await DayLog.create({
        userId: testUser.id,
        date: '2026-01-30',
        sleep: { duration: 450 },
      });

      const res = await request(app)
        .get('/api/daylogs?startDate=2026-01-24&endDate=2026-01-26')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.daylogs).toHaveLength(1);
    });

    it('should handle pagination with limit', async () => {
      // Create multiple daylogs
      for (let i = 1; i <= 35; i++) {
        await DayLog.create({
          userId: testUser.id,
          date: `2026-01-${String(i).padStart(2, '0')}`,
          sleep: { duration: 480 },
        });
      }

      const res = await request(app)
        .get('/api/daylogs?page=2&limit=20')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/daylogs/today', () => {
    it('should return or create today\'s daylog', async () => {
      const res = await request(app)
        .get('/api/daylogs/today')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.date).toBeDefined();
    });
  });

  describe('POST /api/daylogs', () => {
    it('should create a new daylog with sleep and exercise', async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/daylogs')
        .set(authHeader(testUser.token))
        .send({
          date: today,
          sleep: { duration: 480 },
          exercise: { duration: 45 },
          notes: 'Great day!',
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sleep.duration).toBe(480);
      expect(res.body.data.exercise.duration).toBe(45);
    });

    it('should upsert existing daylog', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Create first
      await request(app)
        .post('/api/daylogs')
        .set(authHeader(testUser.token))
        .send({ date: today, sleep: { duration: 400 } });

      // Update
      const res = await request(app)
        .post('/api/daylogs')
        .set(authHeader(testUser.token))
        .send({ date: today, sleep: { duration: 500 } });

      expect([200, 201]).toContain(res.status);
      expect(res.body.data.sleep?.duration).toBe(500);
    });
  });

  describe('GET /api/daylogs/:date', () => {
    it('should get daylog by date', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Create daylog first
      await DayLog.create({
        userId: testUser.id,
        date: today,
        sleep: { duration: 420 },
      });

      const res = await request(app)
        .get(`/api/daylogs/${today}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.date).toBe(today);
    });

    it('should return 404 for non-existent date', async () => {
      const res = await request(app)
        .get('/api/daylogs/2020-01-01')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/daylogs/streak', () => {
    it('should return streak info', async () => {
      // Create a daylog with data
      const today = new Date().toISOString().split('T')[0];
      await DayLog.create({
        userId: testUser.id,
        date: today,
        sleep: { duration: 420 },
      });

      const res = await request(app)
        .get('/api/daylogs/streak')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.currentStreak).toBe(1);
      expect(res.body.data.streakRule).toBeDefined();
    });

    it('should return 0 streak when no logs with data', async () => {
      const res = await request(app)
        .get('/api/daylogs/streak')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.currentStreak).toBe(0);
    });
  });

  describe('PUT /api/daylogs/:date', () => {
    it('should update existing daylog', async () => {
      const today = new Date().toISOString().split('T')[0];
      await DayLog.create({
        userId: testUser.id,
        date: today,
        sleep: { duration: 420 },
      });

      const res = await request(app)
        .put(`/api/daylogs/${today}`)
        .set(authHeader(testUser.token))
        .send({
          sleep: { duration: 480 },
          notes: 'Updated notes',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.sleep?.duration).toBe(480);
      expect(res.body.data.notes).toBe('Updated notes');
    });

    it('should return 404 when updating non-existent daylog', async () => {
      const res = await request(app)
        .put('/api/daylogs/2020-01-01')
        .set(authHeader(testUser.token))
        .send({
          sleep: { duration: 480 },
        });

      expect(res.status).toBe(404);
    });
  });


    it('should return 404 when deleting non-existent daylog', async () => {
      const res = await request(app)
        .delete('/api/daylogs/2020-01-01')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  describe('GET /api/daylogs/summary/week', () => {
    it('should return weekly summary', async () => {
      const today = new Date().toISOString().split('T')[0];
      await DayLog.create({
        userId: testUser.id,
        date: today,
        sleep: { duration: 480 },
        exercise: { duration: 60 },
      });

      const res = await request(app)
        .get('/api/daylogs/summary/week')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.sleep).toBeDefined();
      expect(res.body.data.exercise).toBeDefined();
    });
  });

  describe('DELETE /api/daylogs/:date', () => {
    it('should delete daylog by date', async () => {
      const today = new Date().toISOString().split('T')[0];
      await DayLog.create({ userId: testUser.id, date: today });

      const res = await request(app)
        .delete(`/api/daylogs/${today}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);

      const deleted = await DayLog.findOne({ userId: testUser.id, date: today });
      expect(deleted).toBeNull();
    });
  });
});
