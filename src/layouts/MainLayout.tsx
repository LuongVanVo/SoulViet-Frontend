import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomBar } from '../components/layout/BottomBar';

export const MainLayout = () => {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sidebar-responsive">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 main-responsive overflow-y-auto scrollbar-hide h-full pb-24">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <div className="bottom-bar-responsive">
        <BottomBar />
      </div>
    </div>
  );
};