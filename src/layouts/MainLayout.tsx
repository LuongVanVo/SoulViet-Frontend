import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/layouts/BottomNav';
import { Footer } from '@/layouts/Footer';
import { Navbar } from '@/layouts/Navbar';
import { ScrollToTop } from '@/components/layout';
import { useSignalR } from '@/hooks';
import { useAuthStore } from '@/store';
import { MessageCircle } from 'lucide-react';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  useSignalR();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  const isSocialPage =
    location.pathname.startsWith('/social') ||
    location.pathname.startsWith('/posts') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/notifications');
  return (
    <div className="flex min-h-screen flex-col bg-background text-gray-900">
      <Navbar />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <ScrollToTop />
      <Footer />
      <BottomNav />
      {isLoggedIn && isSocialPage && (
        <button
          onClick={() => navigate('/messages')}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f2ee]/10 text-[#4A8B8B] shadow-sm backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:bg-[#e7f2ee]/40 active:scale-95 md:bottom-8 md:right-8"
          title="Messenger"
        >
          <MessageCircle className="h-7 w-7" />
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-bold text-white ring-2 ring-white">
            1 {/* sẽ thay đổi sau */}
          </span>
        </button>
      )}
    </div>
  );
};