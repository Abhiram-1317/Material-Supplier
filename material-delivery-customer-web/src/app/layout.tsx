import type {Metadata} from "next";
import {ReactNode} from "react";
import {ThemeRegistry} from "@/components/ThemeRegistry";
import {AuthProvider} from "@/context/AuthContext";
import {LocationProvider} from "@/context/LocationContext";
import {CartProvider} from "@/context/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Material Delivery – Customer",
  description: "Order construction materials for your sites",
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>{children}</CartProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
