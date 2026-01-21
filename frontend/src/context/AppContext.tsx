/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { ThemeMode } from '@styles/colors';
import { getTheme } from '@styles/theme';
import { Toast } from '@components/common';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  message: string;
  type: NotificationType;
}

export interface AppContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  showNotification: (message: string, type: NotificationType) => void;
}

export interface AppProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'day-tracker-theme';

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
}

/** App context provider - handles theme and notifications */
export function AppProvider({ children }: AppProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);
  const [notification, setNotification] = useState<Notification | null>(null);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeModeState(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = (): void => {
    setThemeModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (mode: ThemeMode): void => {
    setThemeModeState(mode);
  };

  const showNotification = (message: string, type: NotificationType): void => {
    setNotification({ message, type });
  };

  const hideNotification = (): void => {
    setNotification(null);
  };

  const value: AppContextType = {
    themeMode,
    toggleTheme,
    setThemeMode,
    showNotification,
  };

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <Toast
          open={!!notification}
          message={notification?.message || ''}
          variant={notification?.type}
          onClose={hideNotification}
          transition="slide"
        />
      </ThemeProvider>
    </AppContext.Provider>
  );
}

/** Hook to access app context */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
