import type { ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/layouts/BottomNav';
import { Footer } from '@/layouts/Footer';
import { Navbar } from '@/layouts/Navbar';
import { ScrollToTop } from '@/components/layout';
import { useSignalR } from '@/hooks';
import { useAuthStore } from '@/store';
import { MessageCircle } from 'lucide-react';
import { useChatConversations } from '@/hooks/useChatConversations';

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  useSignalR();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations } = useChatConversations();
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);


  const isSocialPage =
    location.pathname.startsWith('/social') ||
    location.pathname.startsWith('/posts') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/notifications');

  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <div className="flex min-h-screen flex-col bg-background text-gray-900">
      <Navbar />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      {!isMessagesPage && <ScrollToTop />}
      {!isMessagesPage && <Footer />}
      <BottomNav />
      {isLoggedIn && isSocialPage && !isMessagesPage && (
        <button
          onClick={() => navigate('/messages')}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-[#3B6363] shadow-lg backdrop-blur-md border border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:bg-white/40 active:scale-95 md:bottom-8 md:right-8"
          title="Messenger"
        >
          <MessageCircle className="h-7 w-7" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-bold text-white ring-2 ring-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      )}
    </div>
  );
};