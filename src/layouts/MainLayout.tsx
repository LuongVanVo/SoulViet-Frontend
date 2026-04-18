import { Outlet } from 'react-router-dom';
import * as Layout from '@/components';
import { useAuthStore } from '@/store';

export const MainLayout = () => {
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sidebar-responsive">
        <Layout.Sidebar />
      </div>
      <main className="flex-1 ml-64 main-responsive overflow-y-auto scrollbar-hide h-full pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? <Layout.PageLoadingPlaceholder /> : <Outlet />}
        </div>
      </main>
      <div className="bottom-bar-responsive">
        <Layout.BottomBar />
      </div>
    </div>
  );
};