import { type ReactElement, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Person, Security, Settings as SettingsIcon, ManageAccounts } from '@mui/icons-material';
import { MainLayout } from '@components/layout';
import { ErrorBoundary } from '@components/common';
import {
  ProfileSettingsSection,
  SecuritySettingsSection,
  PreferencesSection,
  AccountSettingsSection,
} from '@components/settings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

/** Settings page with profile, security, preferences, and account management */
export default function SettingsPage(): ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <MainLayout>
      <ErrorBoundary>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SettingsIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Settings
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Manage your account, security, and preferences
            </Typography>
          </Box>

          {/* Tabs Navigation */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'fullWidth' : 'standard'}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: { xs: 56, sm: 64 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  gap: 1,
                },
              }}
            >
              <Tab icon={<Person />} iconPosition="start" label="Profile" {...a11yProps(0)} />
              <Tab icon={<Security />} iconPosition="start" label="Security" {...a11yProps(1)} />
              <Tab
                icon={<SettingsIcon />}
                iconPosition="start"
                label="Preferences"
                {...a11yProps(2)}
              />
              <Tab
                icon={<ManageAccounts />}
                iconPosition="start"
                label="Account"
                {...a11yProps(3)}
              />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <ProfileSettingsSection />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <SecuritySettingsSection />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <PreferencesSection />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <AccountSettingsSection />
            </TabPanel>
          </Paper>
        </Container>
      </ErrorBoundary>
    </MainLayout>
  );
}
