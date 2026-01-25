import { describe, it, expect, beforeEach } from '@jest/globals';
import { ExpenseEntry, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../../src/models/expense.model.js';
import { User } from '../../../src/models/user.model.js';
import mongoose from 'mongoose';

describe('ExpenseEntry Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Expense User',
      email: `expense-${Date.now()}@test.com`,
      password: 'password123',
    });
    userId = user._id as mongoose.Types.ObjectId;
  });

  describe('Document creation', () => {
    it('should create expense with required fields', async () => {
      const expense = await ExpenseEntry.create({
        userId,
        date: '2026-01-25',
        category: 'food',
        description: 'Lunch',
        amount: 250,
      });

      expect(expense._id).toBeDefined();
      expect(expense.category).toBe('food');
      expect(expense.amount).toBe(250);
    });

    it('should create expense with all optional fields', async () => {
      const expense = await ExpenseEntry.create({
        userId,
        date: '2026-01-25',
        category: 'transport',
        description: 'Uber ride',
        amount: 150,
        paymentMethod: 'upi',
        merchant: 'Uber',
        notes: 'Airport pickup',
      });

      expect(expense.paymentMethod).toBe('upi');
      expect(expense.merchant).toBe('uber'); // lowercase
    });
  });

  describe('Category validation', () => {
    it('should accept all valid categories', async () => {
      for (const category of EXPENSE_CATEGORIES) {
        const expense = await ExpenseEntry.create({
          userId,
          date: '2026-01-25',
          category,
          description: `${category} expense`,
          amount: 100,
        });
        expect(expense.category).toBe(category);
      }
    });

    it('should reject invalid category', async () => {
      await expect(
        ExpenseEntry.create({
          userId,
          date: '2026-01-25',
          category: 'invalid-category',
          description: 'Test',
          amount: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe('Payment method validation', () => {
    it('should accept all valid payment methods', async () => {
      for (const method of PAYMENT_METHODS) {
        const expense = await ExpenseEntry.create({
          userId,
          date: '2026-01-25',
          category: 'other',
          description: `${method} payment`,
          amount: 100,
          paymentMethod: method,
        });
        expect(expense.paymentMethod).toBe(method);
      }
    });
  });

  describe('Default values', () => {
    it('should default currency to INR', async () => {
      const expense = await ExpenseEntry.create({
        userId,
        date: '2026-01-25',
        category: 'shopping',
        description: 'Groceries',
        amount: 500,
      });

      expect(expense.currency).toBe('INR');
    });

    it('should default source to manual', async () => {
      const expense = await ExpenseEntry.create({
        userId,
        date: '2026-01-25',
        category: 'bills',
        description: 'Electric bill',
        amount: 1500,
      });

      expect(expense.source).toBe('manual');
    });
  });

  describe('Required field validation', () => {
    it('should fail without amount', async () => {
      await expect(
        ExpenseEntry.create({
          userId,
          date: '2026-01-25',
          category: 'food',
          description: 'No amount',
        })
      ).rejects.toThrow();
    });

    it('should fail without description', async () => {
      await expect(
        ExpenseEntry.create({
          userId,
          date: '2026-01-25',
          category: 'food',
          amount: 100,
        })
      ).rejects.toThrow();
    });
  });

  describe('Merchant normalization', () => {
    it('should trim and lowercase merchant name', async () => {
      const expense = await ExpenseEntry.create({
        userId,
        date: '2026-01-25',
        category: 'shopping',
        description: 'Purchase',
        amount: 1000,
        merchant: '  Amazon  ',
      });

      expect(expense.merchant).toBe('amazon');
    });
  });
});
