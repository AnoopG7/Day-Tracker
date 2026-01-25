import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/index.js';
import { createTestUser, authHeader } from '../helpers/auth.helper.js';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
    });

    it('should register with optional phone', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Phone User',
          email: 'phone@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with deactivated account', async () => {
      await User.findOneAndUpdate(
        { email: 'login@example.com' },
        { isActive: false }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .get('/api/auth/me')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(authHeader('invalid-token'));

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .put('/api/auth/profile')
        .set(authHeader(testUser.token))
        .send({
          name: 'Updated Name',
          phone: '1234567890',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should update avatar', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .put('/api/auth/profile')
        .set(authHeader(testUser.token))
        .send({
          avatar: 'https://example.com/avatar.jpg',
        });

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/auth/update-password', () => {
    it('should update password successfully', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .put('/api/auth/update-password')
        .set(authHeader(testUser.token))
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail with wrong current password', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .put('/api/auth/update-password')
        .set(authHeader(testUser.token))
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot password request', async () => {
      await createTestUser();

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'testuser@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not reveal if user does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should fail with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-reset-token',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('should delete account with correct password', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .delete('/api/auth/account')
        .set(authHeader(testUser.token))
        .send({
          password: 'password123',
        });

      expect(res.status).toBe(200);

      // Verify account is deactivated
      const user = await User.findOne({ email: testUser.email });
      expect(user?.isActive).toBe(false);
    });

    it('should fail with wrong password', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .delete('/api/auth/account')
        .set(authHeader(testUser.token))
        .send({
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/users', () => {
    it('should get list of users', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .get('/api/auth/users')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const testUser = await createTestUser();

      const res = await request(app)
        .get('/api/auth/users?page=1&limit=5')
        .set(authHeader(testUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });
});

