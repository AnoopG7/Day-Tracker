import { useState, type ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Link, Stack, Alert, Button as MuiButton } from '@mui/material';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button, Input } from '@components/common';
import { AuthLayout } from '@components/layout';
import { useAuth } from '@hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@schemas/auth.schema';

/** Forgot Password page */
export default function ForgotPasswordPage(): ReactElement {
  const { forgotPassword, isLoading } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData): Promise<void> => {
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  const loading = isLoading || isSubmitting;

  if (emailSent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent you password reset instructions"
        icon={<LockOpenOutlinedIcon />}
      >
        <Stack spacing={3}>
          <Alert severity="success">
            Password reset link has been sent to <strong>{getValues('email')}</strong>. Please check
            your inbox and follow the instructions.
          </Alert>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Didn't receive the email? Check your spam folder or try again.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" fullWidth onClick={() => setEmailSent(false)}>
              Try Different Email
            </Button>
            <MuiButton
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              sx={{ flex: 1 }}
            >
              Back to Login
            </MuiButton>
          </Stack>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email to receive a password reset link"
      icon={<LockOpenOutlinedIcon />}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Alert severity="info">
            Enter the email address associated with your account and we'll send you a link to reset
            your password.
          </Alert>

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

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            loading={loading}
            loadingText="Sending..."
          >
            Send Reset Link
          </Button>

          {/* Back to Login */}
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <ArrowBackIcon fontSize="small" />
              <Typography variant="body2">Back to Sign In</Typography>
            </Link>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
