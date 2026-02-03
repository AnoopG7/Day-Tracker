import { type FC, useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { Edit, Email, Person, Phone, Check } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useAppStore from '@stores/useAppStore';
import { useAppContext } from '@context/AppContext';
import { useProfileUpdate } from '@hooks/useProfileUpdate';
import { profileUpdateSchema } from '@schemas/settings.schema';
import type { ProfileUpdateFormData } from '@schemas/settings.schema';

export const ProfileSettingsSection: FC = () => {
  const user = useAppStore((state) => state.user);
  const { showNotification } = useAppContext();
  const { updateProfile, isLoading, error } = useProfileUpdate();
  const [hasChanges, setHasChanges] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Watch for changes
  const watchedFields = watch();
  useEffect(() => {
    const changed =
      watchedFields.name !== user?.name || watchedFields.phone !== (user?.phone || '');
    setHasChanges(changed);
  }, [watchedFields, user]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    const success = await updateProfile(data);
    if (success) {
      setHasChanges(false);
      reset(data);
    }
  };

  const handleAvatarChange = () => {
    showNotification('Avatar upload feature coming soon!', 'info');
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Profile Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Update your personal information and profile picture
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            mb: 4,
            pb: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatar || ''}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                fontSize: '2rem',
                bgcolor: 'primary.main',
                border: '4px solid',
                borderColor: 'background.paper',
                boxShadow: 3,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              component="label"
              onClick={handleAvatarChange}
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: 2,
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Profile Picture
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              JPG, PNG or WebP. Max size 2MB.
            </Typography>
          </Box>
        </Box>

        {/* Form Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Name Field */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full Name"
                placeholder="Enter your full name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Email Field (Read-only) */}
          <TextField
            label="Email Address"
            value={user?.email || ''}
            fullWidth
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Email cannot be changed"
          />

          {/* Phone Field */}
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone Number"
                placeholder="e.g., 9876543210"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message || 'Optional - 10 to 15 digits'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
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
            disabled={!hasChanges || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <Check />}
            sx={{ minWidth: 140 }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            disabled={!hasChanges || isLoading}
            onClick={() => {
              reset({
                name: user?.name || '',
                phone: user?.phone || '',
              });
              setHasChanges(false);
            }}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};
