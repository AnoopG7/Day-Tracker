import { type ReactElement } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Link, Checkbox, FormControlLabel, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { Button, Input } from '@components/common';
import { AuthLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { loginSchema, type LoginFormData } from '@schemas/auth.schema';

/** Login page */
export default function LoginPage(): ReactElement {
  const { login, isAuthenticated, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      await login({ email: data.email, password: data.password });
    } catch (error) {
    }
  };

  const loading = isLoading || isSubmitting;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      icon={<LockOutlinedIcon />}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
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
                autoFocus
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
              <Input
                {...field}
                label="Password"
                type="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
                showPasswordToggle
              />
            )}
          />

          {/* Remember Me & Forgot Password */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} color="primary" />}
                  label="Remember me"
                  disabled={loading}
                />
              )}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          {/* Register Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
