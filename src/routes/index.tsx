import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Map } from '../pages/Map';
import { AIPlan } from '../pages/AIPlan';
import { Social } from '../pages/Social';
import { Profile } from '../pages/Profile';

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
        element: <Map />,
      },
      {
        path: 'ai-plan',
        element: <AIPlan />,
      },
      {
        path: 'social',
        element: <Social />,
      },
      {
        path: 'community',
        element: <Social />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
]);
