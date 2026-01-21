import { useMemo, type ReactElement } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import { AppProvider, useAppContext } from '@context/AppContext';
import AppRoutes from '@routes/index';
import { getTheme } from '@styles/theme';

/** App content with theme and notifications */
function AppContent(): ReactElement {
  const { themeMode, notification, hideNotification } = useAppContext();
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
      <Snackbar
        open={!!notification}
        autoHideDuration={5000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification ? (
          <Alert onClose={hideNotification} severity={notification.type} variant="filled">
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}

/** Main App component */
function App(): ReactElement {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
