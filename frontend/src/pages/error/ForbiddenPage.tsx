import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Button } from '@components/common';
import { ForbiddenIllustration } from '@assets/illustrations';

/** 403 Error Page - Access Forbidden */
export default function ForbiddenPage(): ReactElement {
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
        <ForbiddenIllustration sx={{ mb: 4 }} />

        {/* Error Message */}
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          Access Forbidden
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
          Sorry, you don't have permission to access this page. If you believe this is an error,
          please contact your administrator.
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
