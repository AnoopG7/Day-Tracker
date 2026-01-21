import { useState, type ReactElement, type ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Avatar,
  Chip,
  Card as MuiCard,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { useAppContext } from '@context/AppContext';
import {
  Button,
  Input,
  Select,
  LoadingSpinner,
  ConfirmDialog,
  EmptyState,
  PageSkeleton,
  Card,
  Badge,
  Modal,
  ProgressBar,
  StatCard,
  DataTable,
  type Column,
} from '@components/common';
import { MainLayout, PageContainer, Footer } from '@components/layout';

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps): ReactElement {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );
}

// Sample data for DataTable
interface User {
  [key: string]: unknown;
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const sampleUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'Active' },
];

const userColumns: Column<User>[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'role', label: 'Role', minWidth: 100 },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value) => (
      <Badge
        label={value as string}
        colorVariant={(value as string) === 'Active' ? 'success' : 'default'}
      />
    ),
  },
];

/** Component Showcase Page - Now with MainLayout! */
export default function ComponentShowcase(): ReactElement {
  const { showNotification } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleLoadingDemo = (): void => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <MainLayout>
      <PageContainer
        title="Component Showcase"
        subtitle="Preview all available UI components with MainLayout"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Components' }]}
        action={
          <Button variant="contained" leftIcon={<AddIcon />}>
            Action Button
          </Button>
        }
      >
        {/* Stat Cards */}
        <Section title="Stat Cards (Dashboard)">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Tasks"
                value="1,234"
                icon={<TaskAltIcon />}
                trend={{ value: 12.5, label: 'vs last month' }}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Active Users"
                value="845"
                icon={<PeopleIcon />}
                trend={{ value: -3.2, label: 'vs last week' }}
                color="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Revenue"
                value="$12,450"
                icon={<AttachMoneyIcon />}
                trend={{ value: 8.7, label: 'vs last month' }}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard title="Growth" value="24.5%" icon={<TrendingUpIcon />} color="info" />
            </Grid>
          </Grid>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button variant="contained">Primary</Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
            <Button variant="contained" color="error">
              Error
            </Button>
            <Button variant="contained" color="success">
              Success
            </Button>
            <Button variant="contained" disabled>
              Disabled
            </Button>
            <Button variant="contained" loading loadingText="Loading...">
              Submit
            </Button>
            <Button variant="contained" leftIcon={<AddIcon />}>
              With Icon
            </Button>
            <Button variant="outlined" onClick={handleLoadingDemo} loading={loading}>
              Click to Load
            </Button>
          </Stack>
        </Section>

        {/* Inputs & Select */}
        <Section title="Input Fields & Select">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Basic Input" placeholder="Enter text..." />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="With Search Icon"
                placeholder="Search..."
                startAdornment={<SearchIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="With Error"
                error
                helperText="This field is required"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Password" type="password" placeholder="Enter password" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Email" type="email" placeholder="email@example.com" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Number" type="number" placeholder="0" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input label="Disabled" disabled value="Cannot edit this" />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="With End Icon"
                placeholder="Enter value"
                endAdornment={<CheckCircleIcon color="success" />}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Input
                label="Helper Text"
                helperText="This is helper text"
                placeholder="Type here..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Select
                label="Select Option"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value as string)}
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                  { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
                ]}
                placeholder="Choose an option..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Multiline / Textarea"
                multiline
                rows={3}
                fullWidth
                placeholder="Enter multiple lines..."
              />
            </Grid>
          </Grid>
        </Section>

        {/* Custom Card Component */}
        <Section title="Card Component (with actions menu)">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                title="Task Card"
                subtitle="With menu actions"
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>T</Avatar>}
                actions={[
                  {
                    label: 'Edit',
                    icon: <EditIcon />,
                    onClick: () => showNotification('Edit clicked', 'info'),
                  },
                  {
                    label: 'Delete',
                    icon: <DeleteIcon />,
                    onClick: () => showNotification('Delete clicked', 'error'),
                  },
                ]}
              >
                <Typography variant="body2" color="text.secondary">
                  This card has a dropdown menu in the header. Click the three dots!
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card title="Simple Card" footerActions={<Button size="small">Learn More</Button>}>
                <Typography variant="body2" color="text.secondary">
                  A card with footer actions.
                </Typography>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MuiCard sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Colored Card
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Using MUI Card directly with custom bg.
                  </Typography>
                </CardContent>
              </MuiCard>
            </Grid>
          </Grid>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Badge label="Default" />
            <Badge label="Primary" colorVariant="primary" />
            <Badge label="Secondary" colorVariant="secondary" />
            <Badge label="Success" colorVariant="success" />
            <Badge label="Error" colorVariant="error" />
            <Badge label="Warning" colorVariant="warning" />
            <Badge label="Info" colorVariant="info" />
            <Badge label="Outlined" chipVariant="outlined" colorVariant="primary" />
          </Stack>
        </Section>

        {/* Progress Bars */}
        <Section title="Progress Bars">
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Right label:
              </Typography>
              <ProgressBar value={65} showLabel />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Top label:
              </Typography>
              <ProgressBar value={45} showLabel labelPosition="top" color="secondary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Inside label (tall):
              </Typography>
              <ProgressBar
                value={80}
                showLabel
                labelPosition="inside"
                height={20}
                color="success"
              />
            </Box>
          </Stack>
        </Section>

        {/* Data Table */}
        <Section title="Data Table (sortable, searchable)">
          <DataTable
            columns={userColumns}
            rows={sampleUsers}
            rowKey="id"
            onRowClick={(row) => showNotification(`Clicked: ${row.name}`, 'info')}
          />
        </Section>

        {/* Alerts */}
        <Section title="Alerts & Notifications">
          <Stack spacing={2}>
            <Alert severity="success">This is a success alert - brighter now!</Alert>
            <Alert severity="info">This is an info alert with border.</Alert>
            <Alert severity="warning">This is a warning alert.</Alert>
            <Alert severity="error">This is an error alert.</Alert>
          </Stack>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Toast Notifications:
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                size="small"
                color="success"
                onClick={() => showNotification('Success!', 'success')}
              >
                Success
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => showNotification('Error!', 'error')}
              >
                Error
              </Button>
              <Button size="small" color="info" onClick={() => showNotification('Info!', 'info')}>
                Info
              </Button>
              <Button
                size="small"
                color="warning"
                onClick={() => showNotification('Warning!', 'warning')}
              >
                Warning
              </Button>
            </Stack>
          </Box>
        </Section>

        {/* Loading States */}
        <Section title="Loading States">
          <FormControlLabel
            control={
              <Switch checked={showSkeleton} onChange={(e) => setShowSkeleton(e.target.checked)} />
            }
            label="Show Skeleton Loaders"
          />
          {showSkeleton ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Card:
                </Typography>
                <PageSkeleton type="card" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  List:
                </Typography>
                <PageSkeleton type="list" />
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mt: 2 }}>
              <LoadingSpinner size={24} />
              <LoadingSpinner size={40} message="Loading..." />
            </Box>
          )}
        </Section>

        {/* Empty State */}
        <Section title="Empty State">
          <EmptyState
            title="No items found"
            description="Start by adding your first item."
            action={{ label: 'Add Item', onClick: () => showNotification('Add clicked!', 'info') }}
          />
        </Section>

        {/* Dialogs & Modals */}
        <Section title="Dialogs & Modals">
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => setDialogOpen(true)}>
              Confirm Dialog
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setModalOpen(true)}>
              Custom Modal
            </Button>
          </Stack>
          <ConfirmDialog
            open={dialogOpen}
            title="Confirm Action"
            message="Are you sure you want to perform this action?"
            confirmText="Yes, Confirm"
            cancelText="Cancel"
            confirmColor="error"
            onConfirm={() => {
              setDialogOpen(false);
              showNotification('Confirmed!', 'success');
            }}
            onCancel={() => setDialogOpen(false)}
          />
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Custom Modal"
            actions={
              <>
                <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setModalOpen(false);
                    showNotification('Modal action!', 'success');
                  }}
                >
                  Save
                </Button>
              </>
            }
          >
            <Typography>
              This is a custom modal component with title, content, and action buttons.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Input label="Sample Input" placeholder="Type here..." />
            </Box>
          </Modal>
        </Section>

        {/* Icon Buttons & Avatars */}
        <Section title="Icon Buttons & Avatars">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Icon Buttons:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Add">
                  <IconButton color="primary">
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton color="secondary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Warning">
                  <IconButton color="warning">
                    <WarningIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Avatars:
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>A</Avatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>B</Avatar>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>C</Avatar>
                <Avatar sx={{ width: 48, height: 48 }}>LG</Avatar>
              </Stack>
            </Box>
          </Box>
        </Section>

        {/* MUI Chips for reference */}
        <Section title="Chips (MUI)">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Default" />
            <Chip label="Primary" color="primary" />
            <Chip label="With Icon" icon={<CheckCircleIcon />} color="success" />
            <Chip label="Deletable" onDelete={() => {}} />
            <Chip label="Outlined" variant="outlined" color="primary" />
          </Stack>
        </Section>

        {/* Footer */}
        <Box sx={{ mt: 4 }}>
          <Footer />
        </Box>
      </PageContainer>
    </MainLayout>
  );
}
