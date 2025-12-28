import {MD3LightTheme, configureFonts, MD3Theme} from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },
  displayMedium: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '700' as const,
  },
  titleLarge: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '600' as const,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontWeight: '500' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '400' as const,
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    fontWeight: '500' as const,
  },
};

export const colors = {
  primary: '#1A73E8',
  primaryDark: '#1557B0',
  secondary: '#FFB020',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#DC2626',
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const typography = {
  title1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
};

export const elevations = {
  card: 2,
  raised: 4,
  sheet: 8,
};

const basePaperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: '#F2F4F7',
    outline: colors.border,
    error: colors.error,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
  },
  fonts: configureFonts({config: fontConfig}),
};

export const appTheme = {
  paper: basePaperTheme,
  colors,
  spacing,
  radii,
  typography,
  elevations,
};

export type AppTheme = typeof appTheme;
