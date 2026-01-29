import type { ReactElement, ReactNode } from 'react';
import { Box, Container, Toolbar, Typography } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { IconButton, Tooltip } from '@mui/material';
import { useAppContext } from '@context/AppContext';

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

/** Minimal layout for auth pages (login, register, etc.) */
export function AuthLayout({ children, title, subtitle, icon }: AuthLayoutProps): ReactElement {
  const { themeMode, toggleTheme } = useAppContext();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'flex-end',
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      >
        <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton onClick={toggleTheme} color="inherit">
            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        {(title || subtitle || icon) && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {icon && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  mb: 2,
                }}
              >
                {icon}
              </Box>
            )}
            {title && (
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </Container>

      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Day Tracker
        </Typography>
      </Box>
    </Box>
  );
}

export default AuthLayout;
