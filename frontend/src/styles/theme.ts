import { createTheme, type ThemeOptions, type Theme } from '@mui/material/styles';
import {
  lightPalette,
  darkPalette,
  shadows,
  neutral,
  type ThemeMode,
  type ShadowSet,
  type ThemePalette,
} from './colors';

/** Shared typography configuration */
const typography: ThemeOptions['typography'] = {
  fontFamily:
    '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  button: {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

/** Shared theme options used by both light and dark themes */
const sharedThemeOptions: ThemeOptions = {
  typography,
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
};

/** Generate component overrides based on theme mode */
function getComponentOverrides(
  mode: ThemeMode,
  currentShadows: ShadowSet,
  palette: ThemePalette
): ThemeOptions['components'] {
  const isDark = mode === 'dark';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: isDark ? neutral[900] : neutral[100],
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? neutral[700] : neutral[300],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: isDark ? neutral[600] : neutral[400],
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: currentShadows.button,
          },
        },
        contained: {
          '&:hover': {
            boxShadow: currentShadows.sm,
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
        sizeSmall: {
          padding: '6px 14px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '0.9375rem',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: currentShadows.card,
          border: `1px solid ${palette.divider}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '20px 24px 16px',
        },
        title: {
          fontWeight: 600,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderWidth: 1.5,
            },
            '&:hover fieldset': {
              borderWidth: 1.5,
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: currentShadows.sm,
        },
        elevation2: {
          boxShadow: currentShadows.md,
        },
        elevation3: {
          boxShadow: currentShadows.lg,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: currentShadows.sm,
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: currentShadows.lg,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: currentShadows.xl,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '6px 12px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.15)',
          borderColor: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.3)',
          color: isDark ? '#4ade80' : '#15803d',
          '& .MuiAlert-icon': {
            color: isDark ? '#4ade80' : '#22c55e',
          },
        },
        standardError: {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)',
          color: isDark ? '#f87171' : '#b91c1c',
          '& .MuiAlert-icon': {
            color: isDark ? '#f87171' : '#ef4444',
          },
        },
        standardWarning: {
          backgroundColor: isDark ? 'rgba(251, 191, 36, 0.25)' : 'rgba(251, 191, 36, 0.15)',
          borderColor: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(251, 191, 36, 0.3)',
          color: isDark ? '#fbbf24' : '#b45309',
          '& .MuiAlert-icon': {
            color: isDark ? '#fbbf24' : '#f59e0b',
          },
        },
        standardInfo: {
          backgroundColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.15)',
          borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.3)',
          color: isDark ? '#38bdf8' : '#0369a1',
          '& .MuiAlert-icon': {
            color: isDark ? '#38bdf8' : '#0ea5e9',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginLeft: 8,
          marginRight: 8,
          '&.Mui-selected': {
            backgroundColor: isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(20, 184, 166, 0.1)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: isDark ? neutral[900] : neutral[50],
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  };
}

/** Create light theme */
export function createLightTheme(): Theme {
  return createTheme({
    ...sharedThemeOptions,
    palette: lightPalette,
    components: getComponentOverrides('light', shadows.light, lightPalette),
  });
}

/** Create dark theme */
export function createDarkTheme(): Theme {
  return createTheme({
    ...sharedThemeOptions,
    palette: darkPalette,
    components: getComponentOverrides('dark', shadows.dark, darkPalette),
  });
}

/** Get theme by mode */
export function getTheme(mode: ThemeMode): Theme {
  return mode === 'dark' ? createDarkTheme() : createLightTheme();
}

export default createLightTheme();
