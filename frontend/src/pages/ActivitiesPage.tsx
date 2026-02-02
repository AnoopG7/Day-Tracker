import { type FC, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useActivityTemplates } from '@/hooks/useActivityTemplates';
import { ActivityTemplateTable } from '@/components/activities/ActivityTemplateTable';
import { ActivityTemplateDialog } from '@/components/activities/ActivityTemplateDialog';
import { DeleteConfirmDialog } from '@/components/activities/DeleteConfirmDialog';
import { MainLayout } from '@components/layout';
import { useAppContext } from '@/context/AppContext';
import type {
  ActivityTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '@/types/activityTemplate.types';

/**
 * Activities Page
 * Manage custom activity templates that appear in the dashboard
 */
export const ActivitiesPage: FC = () => {
  const { showNotification } = useAppContext();
  const { templates, isLoading, error, createTemplate, updateTemplate, deleteTemplate } =
    useActivityTemplates();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ActivityTemplate | null>(null);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Handlers
  const handleOpenCreateDialog = () => {
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (template: ActivityTemplate) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (data: CreateTemplateDto | UpdateTemplateDto) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, data as UpdateTemplateDto);
        showNotification('Activity template updated successfully! ✓', 'success');
      } else {
        await createTemplate(data as CreateTemplateDto);
        showNotification('Activity template created successfully! ✓', 'success');
      }
      handleCloseDialog();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to save template';
      showNotification(message, 'error');
      throw err;
    }
  };

  const handleDeleteClick = (template: ActivityTemplate) => {
    setDeletingTemplate(template);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;

    try {
      await deleteTemplate(deletingTemplate._id);
      showNotification('Activity template deleted successfully! ✓', 'success');
      setDeletingTemplate(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to delete template';
      showNotification(message, 'error');
    }
  };

  const handleCancelDelete = () => {
    setDeletingTemplate(null);
  };

  // Loading State
  if (isLoading) {
    return (
      <MainLayout>
        <Box>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />

          {/* Search bar skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
            <Skeleton variant="rectangular" width={300} height={40} />
            <Skeleton variant="rectangular" width={150} height={40} />
          </Box>

          {/* Table skeleton */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Activity Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Category
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Icon
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Default Duration
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={600}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={60} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </MainLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load activity templates. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Box>
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Activity Templates
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create and manage custom activities that appear in your daily tracker
        </Typography>

        {/* Actions Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            mb: 3,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <TextField
            size="small"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: 1, sm: '0 1 300px' } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Create Activity
          </Button>
        </Box>

        {/* Empty State */}
        {templates.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              p: 6,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No activity templates yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first custom activity template to start tracking!
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
              Create Your First Activity
            </Button>
          </Paper>
        )}

        {/* Templates Table */}
        {templates.length > 0 && (
          <>
            {filteredTemplates.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', p: 4, textAlign: 'center' }}
              >
                <Typography variant="body1" color="text.secondary">
                  No activities match your search
                </Typography>
              </Paper>
            ) : (
              <ActivityTemplateTable
                templates={filteredTemplates}
                onEdit={handleOpenEditDialog}
                onDelete={handleDeleteClick}
              />
            )}
          </>
        )}

        {/* Create/Edit Dialog */}
        <ActivityTemplateDialog
          open={isDialogOpen}
          template={editingTemplate}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={!!deletingTemplate}
          templateName={deletingTemplate?.name || ''}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </Box>
    </MainLayout>
  );
};

export default ActivitiesPage;
