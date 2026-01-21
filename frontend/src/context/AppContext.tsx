/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ThemeMode } from '@styles/colors';

/** Notification type */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/** Notification state */
export interface Notification {
  message: string;
  type: NotificationType;
}

/** App context state and actions */
export interface AppContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  notification: Notification | null;
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

/** App provider props */
export interface AppProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'day-tracker-theme';

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Get initial theme from localStorage or system preference */
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

/** App context provider */
export function AppProvider({ children }: AppProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialTheme);
  const [notification, setNotification] = useState<Notification | null>(null);

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
    setTimeout(() => setNotification(null), 5000);
  };

  const hideNotification = (): void => {
    setNotification(null);
  };

  const value: AppContextType = {
    themeMode,
    toggleTheme,
    setThemeMode,
    notification,
    showNotification,
    hideNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
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
