import type {Metadata} from 'next';
import './globals.css';
import {Providers} from './providers';
import {SupplierAuthProvider} from '@/context/SupplierAuthContext';

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
        <SupplierAuthProvider>
          <Providers>{children}</Providers>
        </SupplierAuthProvider>
      </body>
    </html>
  );
}
