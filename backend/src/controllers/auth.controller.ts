import { Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/index.js';
import { generateToken } from '../utils/jwt.util.js';
import { successResponse } from '../utils/apiResponse.util.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';
import type { AuthRequest } from '../types/index.js';
import type {
  RegisterInput,
  LoginInput,
  UpdatePasswordInput,
  ResetPasswordInput,
} from '../validations/auth.validation.js';

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, phone } = req.body as RegisterInput;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User already exists with this email');
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id.toString(), user.email);

  successResponse(
    res,
    {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
    'User registered successfully',
    201
  );
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated. Please contact support.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user._id.toString(), user.email);

  successResponse(
    res,
    {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
    'Login successful'
  );
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  successResponse(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    'User profile fetched'
  );
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, avatar, timezone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?.userId,
    { $set: { name, phone, avatar, timezone } },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('User not found');
  }

  successResponse(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      timezone: user.timezone,
    },
    'Profile updated successfully'
  );
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 */
export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as UpdatePasswordInput;

  const user = await User.findById(req.user?.userId).select('+password');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  successResponse(res, null, 'Password updated successfully');
});

/**
 * @desc    Forgot password - request reset
 * @route   POST /api/auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists for security
    successResponse(res, null, 'If an account exists, you will receive reset instructions.');
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  // In development, log the reset URL
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Password Reset URL:', resetUrl);
  }

  // TODO: Send email with resetUrl

  successResponse(res, null, 'Password reset instructions sent to your email');
});

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 */
export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, newPassword } = req.body as ResetPasswordInput;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  successResponse(res, null, 'Password reset successful');
});

/**
 * @desc    Delete account (soft delete)
 * @route   DELETE /api/auth/account
 */
export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { password } = req.body;

  const user = await User.findById(req.user?.userId).select('+password');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify password before deletion
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid password');
  }

  // Soft delete - mark as inactive
  user.isActive = false;
  await user.save();

  successResponse(res, null, 'Account deleted successfully');
});

/**
 * @desc    Export user data
 * @route   GET /api/auth/export-data
 */
export const exportUserData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  const user = await User.findById(userId).select(
    '-password -resetPasswordToken -resetPasswordExpires'
  );
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Import models dynamically to avoid circular dependencies
  const { DayLog } = await import('../models/daylog.model.js');
  const { NutritionEntry } = await import('../models/nutrition.model.js');
  const { ExpenseEntry } = await import('../models/expense.model.js');
  const { CustomActivity } = await import('../models/customactivity.model.js');

  // Fetch all user data
  const [daylogs, nutrition, expenses, customActivities] = await Promise.all([
    DayLog.find({ user: userId }).lean(),
    NutritionEntry.find({ userId }).lean(),
    ExpenseEntry.find({ userId }).lean(),
    CustomActivity.find({ user: userId }).lean(),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      timezone: user.timezone,
      createdAt: user.createdAt,
    },
    statistics: {
      totalDayLogs: daylogs.length,
      totalNutritionEntries: nutrition.length,
      totalExpenses: expenses.length,
      totalCustomActivities: customActivities.length,
    },
    data: {
      daylogs,
      nutrition,
      expenses,
      customActivities,
    },
  };

  // Set headers for file download
  const filename = `daytracker-export-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  res.json(exportData);
});

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/auth/users
 */
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '100', page = '1' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 100));

  const [users, total] = await Promise.all([
    User.find({ isActive: true })
      .select('_id name email phone avatar createdAt')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 }),
    User.countDocuments({ isActive: true }),
  ]);

  successResponse(
    res,
    {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
    'Users fetched successfully'
  );
});
