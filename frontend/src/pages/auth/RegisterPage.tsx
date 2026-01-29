import { type ReactElement } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Stack,
  LinearProgress,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

import { Button, Input } from '@components/common';
import { AuthLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@schemas/auth.schema';

/**
 * Calculate password strength (0-100)
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 6) strength += 25;
  if (password.length >= 10) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;
  return Math.min(100, strength);
}

/**
 * Get password strength color
 */
function getPasswordStrengthColor(strength: number): 'error' | 'warning' | 'success' {
  if (strength < 50) return 'error';
  if (strength < 75) return 'warning';
  return 'success';
}

/** Register page */
export default function RegisterPage(): ReactElement {
  const { register, isAuthenticated, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password') || '';
  const passwordStrength = calculatePasswordStrength(password);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (error) {
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to start tracking your daily activities"
      icon={<PersonAddOutlinedIcon />}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Full Name"
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Email Address"
                type="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
              />
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Box>
                <Input
                  {...field}
                  label="Password"
                  type="password"
                  autoComplete="new-password"
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
                        {passwordStrength < 50
                          ? 'Weak'
                          : passwordStrength < 75
                            ? 'Medium'
                            : 'Strong'}
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
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={loading}
                showPasswordToggle
              />
            )}
          />

          {/* Terms & Conditions */}
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} color="primary" />}
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="#" sx={{ textDecoration: 'none' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" sx={{ textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                disabled={loading}
                sx={{ alignItems: 'center', m: 0 }}
              />
            )}
          />
          {errors.acceptTerms && (
            <Typography variant="caption" color="error">
              {errors.acceptTerms.message}
            </Typography>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            loadingText="Creating account..."
          >
            Create Account
          </Button>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
