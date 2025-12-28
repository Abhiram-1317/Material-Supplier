import type {Metadata} from 'next';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {dashboardTheme} from '../theme/theme';
import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Material Delivery Supplier',
  description: 'Supplier portal for material delivery management',
};

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={dashboardTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
