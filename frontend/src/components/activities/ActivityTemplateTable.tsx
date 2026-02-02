import { type FC, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import type { ActivityTemplate } from '@/types/activityTemplate.types';
import { CATEGORY_INFO } from '@/types/activityTemplate.types';

interface ActivityTemplateTableProps {
  templates: ActivityTemplate[];
  onEdit: (template: ActivityTemplate) => void;
  onDelete: (template: ActivityTemplate) => void;
}

export const ActivityTemplateTable: FC<ActivityTemplateTableProps> = ({
  templates,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: ActivityTemplate) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleEdit = () => {
    if (selectedTemplate) {
      onEdit(selectedTemplate);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedTemplate) {
      onDelete(selectedTemplate);
      handleMenuClose();
    }
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {templates.map((template) => {
          const categoryInfo = CATEGORY_INFO[template.category];
          return (
            <Card
              key={template._id}
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
                      {template.name}
                    </Typography>
                    <Chip
                      label={categoryInfo.label}
                      size="small"
                      sx={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Box>

                {template.defaultDuration && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Default: {template.defaultDuration} minutes
                  </Typography>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(template)}
                    fullWidth
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(template)}
                    fullWidth
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // Desktop Table View
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
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
            {templates.map((template) => {
              const categoryInfo = CATEGORY_INFO[template.category];
              return (
                <TableRow
                  key={template._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    >
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={categoryInfo.label}
                      size="small"
                      sx={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {template.defaultDuration ? `${template.defaultDuration} min` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="More actions">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, template)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
