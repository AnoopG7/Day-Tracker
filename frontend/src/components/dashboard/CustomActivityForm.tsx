import { type FC } from 'react';
import { Grid, Paper, Typography, Divider, TextField } from '@mui/material';

interface CustomActivityFormProps {
  templates: string[];
  customActivities: Record<
    string,
    {
      duration: string;
      notes: string;
    }
  >;
  onUpdateActivity: (activityName: string, field: 'duration' | 'notes', value: string) => void;
}

/**
 * Custom activities form for user-defined activity templates
 */
export const CustomActivityForm: FC<CustomActivityFormProps> = ({
  templates,
  customActivities,
  onUpdateActivity,
}) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        🎯 Custom Activities
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {templates.map((activityName) => (
          <Grid key={activityName} size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600} color="secondary" gutterBottom>
                {activityName.charAt(0).toUpperCase() + activityName.slice(1)}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                size="small"
                label="Duration (min)"
                type="number"
                value={customActivities[activityName]?.duration || ''}
                onChange={(e) => onUpdateActivity(activityName, 'duration', e.target.value)}
                sx={{ mb: 1.5 }}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Notes (optional)"
                value={customActivities[activityName]?.notes || ''}
                onChange={(e) => onUpdateActivity(activityName, 'notes', e.target.value)}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default CustomActivityForm;
