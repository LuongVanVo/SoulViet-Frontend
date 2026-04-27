import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/layouts/BottomNav';
import { Footer } from '@/layouts/Footer';
import { Navbar } from '@/layouts/Navbar';
import { ScrollToTop } from '@/components/layout';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="pb-24 md:pb-28 lg:pb-20">
        {children ?? <Outlet />}
      </main>
      <ScrollToTop />
      <Footer />
      <BottomNav />
    </div>
  );
};