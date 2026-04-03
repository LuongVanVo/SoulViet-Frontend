import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';

// Simple placeholder page for other routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full min-h-[50vh]">
    <h2 className="text-2xl font-bold text-primary">{title}</h2>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'map',
        element: <Placeholder title="Bản đồ (Coming Soon)" />,
      },
      {
        path: 'ai-plan',
        element: <Placeholder title="AI Plan (Coming Soon)" />,
      },
      {
        path: 'community',
        element: <Placeholder title="Cộng đồng (Coming Soon)" />,
      },
      {
        path: 'profile',
        element: <Placeholder title="Cá nhân (Coming Soon)" />,
      },
    ],
  },
]);
