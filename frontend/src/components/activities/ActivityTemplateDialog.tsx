import { type FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Alert,
} from '@mui/material';
import type {
  ActivityTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  ActivityCategory,
} from '@/types/activityTemplate.types';
import { CATEGORY_INFO, RESERVED_NAMES } from '@/types/activityTemplate.types';

interface ActivityTemplateDialogProps {
  open: boolean;
  template: ActivityTemplate | null; // null = create mode, not null = edit mode
  onClose: () => void;
  onSubmit: (data: CreateTemplateDto | UpdateTemplateDto) => Promise<void>;
}

export const ActivityTemplateDialog: FC<ActivityTemplateDialogProps> = ({
  open,
  template,
  onClose,
  onSubmit,
}) => {
  const isEditMode = !!template;

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('health');
  const [defaultDuration, setDefaultDuration] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (template) {
        // Edit mode - populate with existing data
        setName(template.name);
        setCategory(template.category);
        setDefaultDuration(template.defaultDuration?.toString() || '');
      } else {
        // Create mode - reset to defaults
        setName('');
        setCategory('health');
        setDefaultDuration('');
      }
      setError('');
      setErrors({});
    }
  }, [open, template]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Activity name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Activity name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Activity name cannot exceed 50 characters';
    } else if (
      RESERVED_NAMES.includes(name.trim().toLowerCase() as (typeof RESERVED_NAMES)[number])
    ) {
      newErrors.name = 'This name is reserved by the system';
    } else if (!/^[a-zA-Z0-9 '-]+$/.test(name)) {
      newErrors.name = 'Only letters, numbers, spaces, hyphens, and apostrophes allowed';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (defaultDuration && (parseInt(defaultDuration) < 1 || parseInt(defaultDuration) > 1440)) {
      newErrors.defaultDuration = 'Duration must be between 1 and 1440 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError('');

    try {
      const data: CreateTemplateDto | UpdateTemplateDto = {
        name: name.trim().toLowerCase(),
        category,
        ...(defaultDuration && { defaultDuration: parseInt(defaultDuration) }),
      };

      await onSubmit(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save template. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Enter key to submit
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onKeyDown={handleKeyPress}>
      <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Activity Template</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Name Field */}
        <TextField
          autoFocus
          fullWidth
          label="Activity Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name || 'e.g., yoga, reading, guitar practice'}
          required
          sx={{ mt: 1, mb: 2 }}
          inputProps={{ maxLength: 50 }}
        />

        {/* Category Select */}
        <FormControl fullWidth required error={!!errors.category} sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
          >
            {Object.values(CATEGORY_INFO).map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: cat.color,
                    }}
                  />
                  <span>{cat.label}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
        </FormControl>

        {/* Default Duration */}
        <TextField
          fullWidth
          type="number"
          label="Default Duration (Optional)"
          value={defaultDuration}
          onChange={(e) => setDefaultDuration(e.target.value)}
          error={!!errors.defaultDuration}
          helperText={errors.defaultDuration || 'Pre-fill this duration when logging activities'}
          InputProps={{
            endAdornment: 'min',
          }}
          inputProps={{ min: 1, max: 1440 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
