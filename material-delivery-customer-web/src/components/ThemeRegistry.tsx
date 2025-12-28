"use client";

import {ReactNode} from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter";
import {ThemeProvider, CssBaseline} from "@mui/material";
import {customerTheme} from "@/theme/theme";

// Provides a stable Emotion cache for Next.js App Router SSR to avoid hydration mismatches.
export function ThemeRegistry({children}: {children: ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={customerTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
