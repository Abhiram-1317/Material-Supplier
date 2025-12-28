import {createTheme} from '@mui/material/styles';

const fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const dashboardTheme = createTheme({
  palette: {
    primary: {main: '#1A73E8'},
    secondary: {main: '#FFB020'},
    background: {
      default: '#F3F4F6',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
    success: {main: '#10B981'},
    error: {main: '#DC2626'},
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily,
    h1: {fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2},
    h2: {fontSize: '2rem', fontWeight: 700, lineHeight: 1.25},
    h3: {fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3},
    h4: {fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.35},
    h5: {fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4},
    h6: {fontSize: '1rem', fontWeight: 600, lineHeight: 1.4},
    subtitle1: {fontSize: '1rem', fontWeight: 500},
    subtitle2: {fontSize: '0.95rem', fontWeight: 500},
    body1: {fontSize: '0.95rem', lineHeight: 1.6},
    body2: {fontSize: '0.9rem', lineHeight: 1.6},
    button: {fontWeight: 600},
  },
});

export type DashboardTheme = typeof dashboardTheme;
