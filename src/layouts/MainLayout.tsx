import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/layouts/BottomNav';
import { Footer } from '@/layouts/Footer';
import { Navbar } from '@/layouts/Navbar';
import { ScrollToTop } from '@/components/layout';
import { useSignalR } from '@/hooks';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  useSignalR();
  return (
    <div className="flex min-h-screen flex-col bg-background text-gray-900">
      <Navbar />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <ScrollToTop />
      <Footer />
      <BottomNav />
    </div>
  );
};