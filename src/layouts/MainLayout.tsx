import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomBar } from '../components/layout/BottomBar';
import { PageLoadingPlaceholder } from '../components/layout/PageLoadingPlaceholder';
import { useAuthStore } from '../store/authStore';

export const MainLayout = () => {
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sidebar-responsive">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 main-responsive overflow-y-auto scrollbar-hide h-full pb-24">
        <div className="max-w-7xl mx-auto">
          {isLoading ? <PageLoadingPlaceholder /> : <Outlet />}
        </div>
      </main>
      <div className="bottom-bar-responsive">
        <BottomBar />
      </div>
    </div>
  );
};