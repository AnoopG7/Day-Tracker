import { type ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { Button } from '@components/common';
import { useAuth } from '@hooks/useAuth';

/** Landing page for unauthenticated users */
export default function LandingPage(): ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const theme = useTheme();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loader during auth check or redirect
  if (isLoading || isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const features = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
      title: 'Track Progress',
      description: 'Monitor your sleep, exercise, and daily activities with detailed analytics.',
      color: theme.palette.primary.main,
    },
    {
      icon: <TimerIcon sx={{ fontSize: 48 }} />,
      title: 'Time Management',
      description: 'Log custom activities with duration tracking and smart insights.',
      color: theme.palette.success.main,
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 48 }} />,
      title: 'Nutrition Tracking',
      description: 'Track meals, macros, and maintain healthy eating habits effortlessly.',
      color: theme.palette.warning.main,
    },
    {
      icon: <MoneyIcon sx={{ fontSize: 48 }} />,
      title: 'Expense Tracking',
      description: 'Keep track of daily expenses with category breakdown and budgets.',
      color: theme.palette.info.main,
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48 }} />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely. Privacy is our priority.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Lightning Fast',
      description: 'Built with modern technology for a smooth, responsive experience.',
      color: theme.palette.error.main,
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.secondary.main} 100%)`,
          py: { xs: 12, md: 18 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'pulse 8s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.8 },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                Track Your Day, Every Day
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  opacity: 0.95,
                  fontWeight: 400,
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                A comprehensive platform to monitor your daily activities, health, nutrition, and
                expenses all in one beautifully designed app.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'center' }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 5,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.16)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    px: 5,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      bgcolor: alpha('#fff', 0.1),
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Everything You Need
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Powerful features to help you stay organized and achieve your goals
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Fade in timeout={1000 + index * 150} key={index}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.12)}`,
                    '& .feature-icon': {
                      transform: 'scale(1.15)',
                    },
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    className="feature-icon"
                    sx={{
                      display: 'inline-flex',
                      p: 2.5,
                      borderRadius: '20px',
                      bgcolor: alpha(feature.color, 0.1),
                      color: feature.color,
                      mb: 3,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
            >
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 5, fontWeight: 400 }}>
              Join thousands of users tracking their daily progress
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Create Your Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          py: 4,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            © {new Date().getFullYear()} Day Tracker. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
