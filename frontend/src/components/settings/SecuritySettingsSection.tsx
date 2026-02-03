import { type FC, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, Check } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePasswordUpdate } from '@hooks/usePasswordUpdate';
import { passwordChangeSchema } from '@schemas/settings.schema';
import type { PasswordChangeFormData } from '@schemas/settings.schema';

/** Calculate password strength score (0-100) */
const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  let strength = 0;

  // Length
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (password.length >= 16) strength += 10;

  // Complexity
  if (/[a-z]/.test(password)) strength += 10;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

  return Math.min(strength, 100);
};

/** Get strength label and color */
const getStrengthInfo = (
  strength: number
): { label: string; color: 'error' | 'warning' | 'success' } => {
  if (strength < 40) return { label: 'Weak', color: 'error' };
  if (strength < 70) return { label: 'Medium', color: 'warning' };
  return { label: 'Strong', color: 'success' };
};

export const SecuritySettingsSection: FC = () => {
  const { updatePassword, isLoading, error, clearError } = usePasswordUpdate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const passwordStrength = calculatePasswordStrength(newPassword || '');
  const strengthInfo = getStrengthInfo(passwordStrength);

  const onSubmit = async (data: PasswordChangeFormData) => {
    const success = await updatePassword(data);
    if (success) {
      reset();
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ensure your account is using a strong password to stay secure
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 500 }}>
          {/* Current Password */}
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type={showCurrentPassword ? 'text' : 'password'}
                label="Current Password"
                placeholder="Enter your current password"
                fullWidth
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* New Password */}
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="Enter a strong password"
                  fullWidth
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {field.value && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password Strength:
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={`${strengthInfo.color}.main`}
                      >
                        {strengthInfo.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={strengthInfo.color}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
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
              <TextField
                {...field}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Check />}
            sx={{ minWidth: 160 }}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
          <Button variant="outlined" size="large" disabled={isLoading} onClick={() => reset()}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};
