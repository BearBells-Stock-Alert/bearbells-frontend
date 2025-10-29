import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthInitializer from './components/AuthIntitializer';
import ClientLayout from './components/ClientLayout';
import { ThemeProvider } from './contexts/ThemeContext';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BearBells Stock Alerts',
  description: 'Stock alert system for BearBells',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 👇 Wrap everything with ThemeProvider */}
        <ThemeProvider>
          <AuthInitializer />
          {/* 👇 ClientLayout will now have access to theme context */}
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}