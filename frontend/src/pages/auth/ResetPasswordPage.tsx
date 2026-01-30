import { type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Stack, Alert, LinearProgress } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

import { Button, Input } from '@components/common';
import { AuthLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormData } from '@schemas/auth.schema';
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '@/utils/password.util';

/** Reset Password page */
export default function ResetPasswordPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password') || '';
  const passwordStrength = calculatePasswordStrength(password);

  const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
    if (!token) {
      throw new Error('Reset token is missing');
    }
    try {
      await resetPassword({ token, password: data.password });
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  const loading = isLoading || isSubmitting;

  // Invalid token state
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="The password reset link is invalid or has expired"
        icon={<LockResetOutlinedIcon />}
      >
        <Stack spacing={3}>
          <Alert severity="error">
            This password reset link is invalid or has expired. Please request a new one.
          </Alert>

          <Button variant="contained" fullWidth href="/forgot-password">
            Request New Link
          </Button>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Choose a new password for your account"
      icon={<LockResetOutlinedIcon />}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Alert severity="info">
            Your new password must be at least 8 characters long and contain uppercase, lowercase,
            numbers, and a special character (@$!%*?&).
          </Alert>

          {/* Password */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Box>
                <Input
                  {...field}
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  showPasswordToggle
                />
                {password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        color={getPasswordStrengthColor(passwordStrength)}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {getPasswordStrengthLabel(passwordStrength)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          />

          {/* Confirm Password */}
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={loading}
                showPasswordToggle
              />
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            loadingText="Resetting..."
          >
            Reset Password
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
