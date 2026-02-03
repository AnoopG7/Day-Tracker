import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  exportUserData,
  getUsers,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter, passwordResetRateLimiter } from '../middlewares/security.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  deleteAccountSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Public routes with stricter rate limiting
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/update-password', authenticate, validate(updatePasswordSchema), updatePassword);
router.get('/export-data', authenticate, exportUserData);
router.delete('/account', authenticate, validate(deleteAccountSchema), deleteAccount);
router.get('/users', authenticate, getUsers);

export default router;
