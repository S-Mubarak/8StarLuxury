'use client';

import { Inter } from 'next/font/google';
import './globals.css';

import Footer from '@/components/user/Footer';
import Header from '@/components/user/Header';
import { usePathname } from 'next/navigation';
import AuthProvider from './providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {!isAdminPage && <Header />}
            <main className="flex-1">{children}</main>
            {!isAdminPage && <Footer />}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
