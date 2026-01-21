/**
 * Day Tracker - Color Palette
 *
 * A warm, professional color system inspired by premium productivity apps.
 * Uses teal/cyan as primary (calm, focused) and coral/terracotta as accent (warm, energetic).
 *
 * USAGE: Always import colors from this file, never use hex codes directly in components.
 */

/** Brand color shades (50-900 scale) */
export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/** Semantic color with variants */
export interface SemanticColorSet {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

/** MUI-compatible palette color */
export interface PaletteColor {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
}

/** Background colors */
export interface BackgroundColors {
  default: string;
  paper: string;
  subtle: string;
}

/** Text colors */
export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
}

/** Action colors */
export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
  disabledBackground: string;
}

/** Brand colors collection */
export interface BrandColors {
  primary: ColorShades;
  secondary: ColorShades;
  accent: ColorShades;
}

/** Custom shadows for light/dark modes */
export interface ShadowSet {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  card: string;
  button: string;
  dropdown: string;
}

/** Full theme palette */
export interface ThemePalette {
  mode: 'light' | 'dark';
  primary: PaletteColor;
  secondary: PaletteColor;
  background: BackgroundColors;
  text: TextColors;
  divider: string;
  action: ActionColors;
  success: SemanticColorSet;
  error: SemanticColorSet;
  warning: SemanticColorSet;
  info: SemanticColorSet;
}

export type ThemeMode = 'light' | 'dark';

// Brand Colors
export const brand: BrandColors = {
  primary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
};

// Semantic Colors
export const semantic: Record<string, SemanticColorSet> = {
  success: {
    light: '#dcfce7',
    main: '#22c55e',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  error: {
    light: '#fee2e2',
    main: '#ef4444',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  warning: {
    light: '#fef3c7',
    main: '#f59e0b',
    dark: '#b45309',
    contrastText: '#000000',
  },
  info: {
    light: '#e0f2fe',
    main: '#0ea5e9',
    dark: '#0369a1',
    contrastText: '#ffffff',
  },
};

// Neutral Colors (Gray scale)
export const neutral: Record<number, string> = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
};

// Light Theme Palette
export const lightPalette: ThemePalette = {
  mode: 'light',
  primary: {
    main: brand.primary[500],
    light: brand.primary[400],
    dark: brand.primary[700],
    contrastText: '#ffffff',
  },
  secondary: {
    main: brand.secondary[500],
    light: brand.secondary[400],
    dark: brand.secondary[700],
    contrastText: '#ffffff',
  },
  background: {
    default: neutral[50],
    paper: neutral[0],
    subtle: neutral[100],
  },
  text: {
    primary: neutral[900],
    secondary: neutral[600],
    disabled: neutral[400],
  },
  divider: neutral[200],
  action: {
    active: neutral[600],
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: neutral[400],
    disabledBackground: neutral[200],
  },
  success: semantic.success,
  error: semantic.error,
  warning: semantic.warning,
  info: semantic.info,
};

// Dark Theme Palette
export const darkPalette: ThemePalette = {
  mode: 'dark',
  primary: {
    main: brand.primary[400],
    light: brand.primary[300],
    dark: brand.primary[600],
    contrastText: neutral[900],
  },
  secondary: {
    main: brand.secondary[400],
    light: brand.secondary[300],
    dark: brand.secondary[600],
    contrastText: neutral[900],
  },
  background: {
    default: neutral[950],
    paper: neutral[900],
    subtle: neutral[800],
  },
  text: {
    primary: neutral[50],
    secondary: neutral[400],
    disabled: neutral[600],
  },
  divider: neutral[800],
  action: {
    active: neutral[400],
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.12)',
    disabled: neutral[600],
    disabledBackground: neutral[800],
  },
  success: {
    light: '#166534',
    main: '#22c55e',
    dark: '#86efac',
    contrastText: '#000000',
  },
  error: {
    light: '#991b1b',
    main: '#f87171',
    dark: '#fecaca',
    contrastText: '#000000',
  },
  warning: {
    light: '#92400e',
    main: '#fbbf24',
    dark: '#fde68a',
    contrastText: '#000000',
  },
  info: {
    light: '#075985',
    main: '#38bdf8',
    dark: '#bae6fd',
    contrastText: '#000000',
  },
};

/** Gradient definitions */
export interface Gradients {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
}

/** Custom colors for specific UI elements */
export interface CustomColors {
  gradients: Gradients;
  chart: string[];
  status: Record<string, string>;
  priority: Record<string, string>;
}

export const customColors: CustomColors = {
  gradients: {
    primary: `linear-gradient(135deg, ${brand.primary[500]} 0%, ${brand.primary[700]} 100%)`,
    secondary: `linear-gradient(135deg, ${brand.secondary[500]} 0%, ${brand.secondary[700]} 100%)`,
    accent: `linear-gradient(135deg, ${brand.accent[400]} 0%, ${brand.secondary[500]} 100%)`,
    dark: `linear-gradient(135deg, ${neutral[800]} 0%, ${neutral[950]} 100%)`,
    light: `linear-gradient(135deg, ${neutral[0]} 0%, ${neutral[100]} 100%)`,
  },
  chart: [
    brand.primary[500],
    brand.secondary[500],
    brand.accent[500],
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#ec4899',
    '#6366f1',
  ],
  status: {
    online: '#22c55e',
    offline: neutral[400],
    busy: '#ef4444',
    away: '#f59e0b',
  },
  priority: {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    none: neutral[400],
  },
};

// Shadows
export const shadows: Record<ThemeMode, ShadowSet> = {
  light: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  dark: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    button: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  },
};
