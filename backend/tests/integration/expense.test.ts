import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { ExpenseEntry } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('Expense Routes', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('POST /api/expenses', () => {
    it('should create expense entry', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          category: 'food',
          description: 'Lunch',
          amount: 250,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(250);
    });

    it('should fail with negative amount', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          category: 'food',
          description: 'Test',
          amount: -100,
        });

      expect(res.status).toBe(400);
    });

    it('should create with payment method', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          category: 'shopping',
          description: 'Clothes',
          amount: 1500,
          paymentMethod: 'upi',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.paymentMethod).toBe('upi');
    });

    it('should create with merchant', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set(authHeader(testUser.token))
        .send({
          date: '2026-01-25',
          category: 'shopping',
          description: 'Groceries',
          amount: 800,
          merchant: 'BigBazaar',
        });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/expenses', () => {
    it('should get expenses with pagination', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'transport',
        description: 'Uber',
        amount: 150,
      });

      const res = await request(app)
        .get('/api/expenses')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.expenses).toHaveLength(1);
    });

    it('should filter by category', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Dinner',
        amount: 300,
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'transport',
        description: 'Bus',
        amount: 50,
      });

      const res = await request(app)
        .get('/api/expenses?category=food')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.expenses).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-20',
        category: 'food',
        description: 'Old expense',
        amount: 100,
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Recent expense',
        amount: 200,
      });

      const res = await request(app)
        .get('/api/expenses?startDate=2026-01-24&endDate=2026-01-26')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.expenses).toHaveLength(1);
    });

    it('should support pagination params', async () => {
      for (let i = 0; i < 15; i++) {
        await ExpenseEntry.create({
          userId: testUser.id,
          date: '2026-01-25',
          category: 'food',
          description: `Expense ${i}`,
          amount: 100 + i,
        });
      }

      const res = await request(app)
        .get('/api/expenses?page=1&limit=5')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.expenses).toHaveLength(5);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should get expense by ID', async () => {
      const entry = await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Lunch',
        amount: 250,
      });

      const res = await request(app)
        .get(`/api/expenses/${entry._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(250);
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/expenses/${fakeId}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/expenses/summary/daily', () => {
    it('should return daily expense summary', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Breakfast',
        amount: 150,
        paymentMethod: 'cash',
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'transport',
        description: 'Taxi',
        amount: 100,
        paymentMethod: 'upi',
      });

      const res = await request(app)
        .get('/api/expenses/summary/daily?date=2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.totalAmount).toBe(250);
      expect(res.body.data.byCategory).toBeDefined();
      expect(res.body.data.byPaymentMethod).toBeDefined();
    });
  });

  describe('GET /api/expenses/by-category', () => {
    it('should return category breakdown', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Lunch',
        amount: 200,
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Dinner',
        amount: 300,
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'transport',
        description: 'Taxi',
        amount: 100,
      });

      const res = await request(app)
        .get('/api/expenses/by-category?date=2026-01-25')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.totalAmount).toBe(600);
    });
  });

  describe('GET /api/expenses/summary/monthly', () => {
    it('should return monthly summary', async () => {
      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-15',
        category: 'food',
        description: 'Groceries',
        amount: 1000,
      });

      await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-20',
        category: 'bills',
        description: 'Electric',
        amount: 1500,
      });

      const res = await request(app)
        .get('/api/expenses/summary/monthly?month=2026-01')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should default to current month when no month provided', async () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      
      await ExpenseEntry.create({
        userId: testUser.id,
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
        category: 'food',
        description: 'Current month expense',
        amount: 500,
      });

      const res = await request(app)
        .get('/api/expenses/summary/monthly')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.period.year).toBe(currentYear);
      expect(res.body.data.period.month).toBe(currentMonth);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update expense', async () => {
      const entry = await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'food',
        description: 'Old description',
        amount: 100,
      });

      const res = await request(app)
        .put(`/api/expenses/${entry._id}`)
        .set(authHeader(testUser.token))
        .send({
          description: 'Updated description',
          amount: 200,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(200);
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should fail to update non-existent expense', async () => {
      const res = await request(app)
        .put('/api/expenses/507f1f77bcf86cd799439011')
        .set(authHeader(testUser.token))
        .send({ amount: 500 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete expense entry', async () => {
      const entry = await ExpenseEntry.create({
        userId: testUser.id,
        date: '2026-01-25',
        category: 'entertainment',
        description: 'Movie',
        amount: 200,
      });

      const res = await request(app)
        .delete(`/api/expenses/${entry._id}`)
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
    });

    it('should fail to delete non-existent expense', async () => {
      const res = await request(app)
        .delete('/api/expenses/507f1f77bcf86cd799439011')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(404);
    });
  });
});

