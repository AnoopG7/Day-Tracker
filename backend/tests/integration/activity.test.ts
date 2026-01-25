import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { CustomActivity } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('Activity Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('POST /api/activities', () => {
    it('should create activity with duration', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          name: 'reading',
          duration: 60,
          notes: 'Read a book',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('reading');
      expect(res.body.data.duration).toBe(60);
    });

    it('should create activity with start/end times', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          name: 'coding',
          startTime: '10:00',
          endTime: '12:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.startTime).toBe('10:00');
      expect(res.body.data.endTime).toBe('12:00');
    });

    it('should reject reserved activity names (sleep, exercise)', async () => {
      const res = await request(app)
        .post('/api/activities')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          name: 'sleep',
          duration: 480,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/activities', () => {
    it('should get activities with pagination', async () => {
      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'meditation',
        duration: 20,
      });

      const res = await request(app)
        .get('/api/activities')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.activities).toHaveLength(1);
    });

    it('should filter by date', async () => {
      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'reading',
        duration: 60,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-20',
        name: 'coding',
        duration: 120,
      });

      const res = await request(app)
        .get('/api/activities?date=2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.activities).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-20',
        name: 'walking',
        duration: 30,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'running',
        duration: 45,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-30',
        name: 'yoga',
        duration: 60,
      });

      const res = await request(app)
        .get('/api/activities?startDate=2026-01-24&endDate=2026-01-26')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.activities).toHaveLength(1);
    });

    it('should handle pagination with multiple pages', async () => {
      // Create 55 activities
      for (let i = 1; i <= 55; i++) {
        await CustomActivity.create({
          userId: testUser.id,
          date: '2026-01-25',
          name: `activity${i}`,
          duration: 30,
        });
      }

      const res = await request(app)
        .get('/api/activities?page=2&limit=30')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.activities).toHaveLength(25);
      expect(res.body.data.pagination.page).toBe(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/activities/stats', () => {
    it('should return activity statistics', async () => {
      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'reading',
        duration: 60,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-24',
        name: 'reading',
        duration: 30,
      });

      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'coding',
        duration: 120,
      });

      const res = await request(app)
        .get('/api/activities/stats')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.totalActivities).toBe(3);
      expect(res.body.data.uniqueActivities).toBe(2);
    });
  });

  describe('GET /api/activities/date/:date', () => {
    it('should get activities by date', async () => {
      await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'yoga',
        duration: 45,
      });

      const res = await request(app)
        .get('/api/activities/date/2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should get single activity by ID', async () => {
      const activity = await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'swimming',
        duration: 45,
      });

      const res = await request(app)
        .get(`/api/activities/${activity._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('swimming');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/activities/${fakeId}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('should update activity', async () => {
      const activity = await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'jogging',
        duration: 30,
      });

      const res = await request(app)
        .put(`/api/activities/${activity._id}`)
        .set(authHeader(testUser.token))
        .send({ duration: 45, notes: 'Felt great!' });

      expect(res.status).toBe(200);
      expect(res.body.data.duration).toBe(45);
      expect(res.body.data.notes).toBe('Felt great!');
    });

    it('should return 404 when updating non-existent activity', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/activities/${fakeId}`)
        .set(authHeader(testUser.token))
        .send({ duration: 60 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('should delete activity', async () => {
      const activity = await CustomActivity.create({
        userId: testUser.id,
        date: '2026-01-25',
        name: 'walking',
        duration: 30,
      });

      const res = await request(app)
        .delete(`/api/activities/${activity._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
    });

    it('should return 404 when deleting non-existent activity', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/activities/${fakeId}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });
});
