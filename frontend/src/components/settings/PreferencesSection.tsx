import { type FC, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';
import { Check, MyLocation, DarkMode, LightMode } from '@mui/icons-material';
import { useAppContext } from '@context/AppContext';
import useAppStore from '@stores/useAppStore';
import { usePreferencesUpdate } from '@hooks/usePreferencesUpdate';
import { timezones } from '@utils/timezones';

export const PreferencesSection: FC = () => {
  const user = useAppStore((state) => state.user);
  const { themeMode, toggleTheme, showNotification } = useAppContext();
  const { updateTimezone, isLoading, error } = usePreferencesUpdate();
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'UTC');
  const hasChanges = selectedTimezone !== user?.timezone;

  const handleAutoDetect = () => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Find matching timezone in the list
      const matchingTimezone = timezones.find((tz) => tz.value === detectedTimezone);

      if (matchingTimezone) {
        setSelectedTimezone(matchingTimezone.value);
        showNotification(`Timezone set to ${matchingTimezone.label}`, 'success');
      } else {
        // If exact match not found, still set the value
        setSelectedTimezone(detectedTimezone);
        showNotification('Timezone auto-detected successfully', 'success');
      }
    } catch {
      showNotification('Failed to detect timezone', 'error');
    }
  };

  const handleSave = async () => {
    await updateTimezone(selectedTimezone);
  };

  // Get current time in selected timezone
  const getCurrentTime = () => {
    try {
      return new Date().toLocaleString('en-US', {
        timeZone: selectedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid timezone';
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your experience and set your preferences
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Theme Section */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Appearance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose how Day Tracker looks to you
        </Typography>
        <FormControlLabel
          control={<Switch checked={themeMode === 'dark'} onChange={toggleTheme} />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {themeMode === 'dark' ? <DarkMode /> : <LightMode />}
              <Typography variant="body2">
                {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Timezone Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Timezone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select your timezone for accurate date and time display
        </Typography>

        <Box sx={{ maxWidth: 500 }}>
          <Autocomplete
            value={timezones.find((tz) => tz.value === selectedTimezone) || null}
            onChange={(_event, newValue) => {
              if (newValue) {
                setSelectedTimezone(newValue.value);
              }
            }}
            options={timezones}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField {...params} label="Select Timezone" placeholder="Search timezones..." />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.value}>
                <Box>
                  <Typography variant="body2">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.offset}
                  </Typography>
                </Box>
              </li>
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MyLocation />}
              onClick={handleAutoDetect}
            >
              Auto-detect
            </Button>
            {selectedTimezone && (
              <Chip
                label={`Current time: ${getCurrentTime()}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Date Format Section */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Date & Time Format
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose how dates and times are displayed
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select defaultValue="MM/DD/YYYY" label="Date Format">
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</MenuItem>
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Time Format</InputLabel>
            <Select defaultValue="12h" label="Time Format">
              <MenuItem value="12h">12-hour (3:00 PM)</MenuItem>
              <MenuItem value="24h">24-hour (15:00)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!hasChanges || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Check />}
          onClick={handleSave}
          sx={{ minWidth: 140 }}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          variant="outlined"
          size="large"
          disabled={!hasChanges || isLoading}
          onClick={() => {
            setSelectedTimezone(user?.timezone || 'UTC');
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};
