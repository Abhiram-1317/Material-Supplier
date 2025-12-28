"use client";

import {ReactNode} from 'react';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import {adminTheme} from '@/theme/theme';

export function Providers({children}: {children: ReactNode}) {
  return (
    <AppRouterCacheProvider options={{key: 'mui'}}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
