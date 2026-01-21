import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppContext } from '@context/AppContext';
import { customColors } from '@styles/colors';

export default function HomePage() {
  const navigate = useNavigate();
  const { themeMode, toggleTheme } = useAppContext();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
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

        {/* Hero Card */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            background: customColors.gradients.primary,
            color: 'white',
            textAlign: 'center',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 64, mb: 2, position: 'relative' }} />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{ position: 'relative' }}
          >
            Day Tracker
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3, position: 'relative' }}>
            Track your day, achieve your goals
          </Typography>
        </Paper>

        {/* CTA Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            onClick={() => navigate('/about')}
          >
            Learn More
          </Button>
        </Stack>

        {/* Footer */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Built with React, TypeScript, Material UI, and ❤️
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
