import {MD3LightTheme, configureFonts, type MD3Theme} from 'react-native-paper';

const fontConfig = configureFonts({
  config: {
    fontFamily: 'System',
  },
});

const primary = '#1A73E8';
const secondary = '#FFB020';

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  roundness: 10,
  colors: {
    ...MD3LightTheme.colors,
    primary,
    secondary,
    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceVariant: '#E5E7EB',
    outline: '#D1D5DB',
    onPrimary: '#FFFFFF',
    onSecondary: '#111827',
    onSurface: '#111827',
    onBackground: '#111827',
  },
};
