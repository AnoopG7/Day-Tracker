import { type FC, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Download, DeleteForever, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAccountDeletion } from '@hooks/useAccountDeletion';
import api from '@services/api';
import { useAppContext } from '@context/AppContext';

export const AccountSettingsSection: FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const { deleteAccount, isLoading } = useAccountDeletion();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [understands, setUnderstands] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await api.get('/auth/export-data', {
        responseType: 'blob',
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/json' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const filename = `daytracker-export-${new Date().toISOString().split('T')[0]}.json`;
      link.setAttribute('download', filename);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      showNotification('Failed to export data. Please try again.', 'error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      navigate('/');
    }
  };

  const canDelete = confirmText === 'DELETE' && understands;

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Account Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Export your data or permanently delete your account
      </Typography>

      {/* Data Export Section */}
      <Box sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Export Your Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Download a copy of all your data including logs, nutrition entries, expenses, and
          activities
        </Typography>
        <Button
          variant="outlined"
          startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
          onClick={handleExportData}
          disabled={isExporting}
          sx={{ minWidth: 160 }}
        >
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </Box>

      {/* Danger Zone */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '2px solid',
          borderColor: 'error.main',
          borderRadius: 2,
          bgcolor: 'error.lighter',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Warning color="error" />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="error.main">
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once you delete your account, there is no going back. Please be certain.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForever />}
          onClick={() => setShowDeleteDialog(true)}
          sx={{ mt: 2 }}
        >
          Delete My Account
        </Button>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => !isLoading && setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <DeleteForever />
            <Typography variant="h6" fontWeight={700}>
              Delete Account
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 3 }}>
            This action is permanent and cannot be undone!
          </Alert>

          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            All your data will be permanently deleted, including:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Daily logs and tracking data
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Nutrition entries and meal records
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Expense records
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
              Custom activities and templates
            </Typography>
            <Typography component="li" variant="body2">
              All analytics and trends data
            </Typography>
          </Box>

          <Typography variant="body2" fontWeight={600} gutterBottom>
            To confirm, type DELETE in the box below:
          </Typography>
          <TextField
            fullWidth
            placeholder="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={confirmText.length > 0 && confirmText !== 'DELETE'}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={understands}
                onChange={(e) => setUnderstands(e.target.checked)}
                color="error"
              />
            }
            label="I understand that this action cannot be reversed"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowDeleteDialog(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={!canDelete || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <DeleteForever />}
          >
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
