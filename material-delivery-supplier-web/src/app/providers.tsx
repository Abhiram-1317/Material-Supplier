"use client";

import {CssBaseline, ThemeProvider} from '@mui/material';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import {dashboardTheme} from '../theme/theme';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({children}: ProvidersProps) {
  return (
    <AppRouterCacheProvider options={{key: 'mui'}}>
      <ThemeProvider theme={dashboardTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
