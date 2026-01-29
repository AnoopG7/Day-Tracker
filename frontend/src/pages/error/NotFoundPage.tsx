import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button } from '@components/common';
import { PageNotFoundIllustration } from '@assets/illustrations';

/** 404 Error Page - Page Not Found */
export default function NotFoundPage(): ReactElement {
  const navigate = useNavigate();

  const handleGoHome = (): void => {
    navigate('/dashboard');
  };

  const handleGoBack = (): void => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        {/* Illustration */}
        <PageNotFoundIllustration sx={{ mb: 4 }} />

        {/* Error Message */}
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
          Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or
          the page has been moved.
        </Typography>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" size="large" startIcon={<HomeIcon />} onClick={handleGoHome}>
            Go to Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
