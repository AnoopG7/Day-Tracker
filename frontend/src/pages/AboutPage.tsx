import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppContext } from '@context/AppContext';

export default function AboutPage() {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useAppContext();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
        }}
      >
        {/* Theme Toggle */}
        <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
          <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            About Day Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Day Tracker is your personal companion for tracking daily activities and achieving your
            goals. Built with modern web technologies for the best user experience.
          </Typography>

          {/* Features */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
            {['Track Tasks', 'Set Goals', 'View Progress', 'Stay Organized'].map((feature) => (
              <Paper
                key={feature}
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: 'background.subtle',
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {feature}
                </Typography>
              </Paper>
            ))}
          </Stack>

          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
