import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { 
  Home, 
  Map, 
  AIPlan, 
  Social, 
  Profile,
  ConfirmEmailPage, 
  ForgotPasswordPage, 
  OAuthPage, 
  SignInPage, 
  SignUpPage, 
  VerifyEmailNoticePage 
} from '@/pages';

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
      {
        path: 'login',
        element: <SignInPage />,
      },
      {
        path: 'register',
        element: <SignUpPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'oauth2',
        element: <OAuthPage />,
      },
      {
        path: 'verify-email-notice',
        element: <VerifyEmailNoticePage />,
      },
      {
        path: 'confirm-email',
        element: <ConfirmEmailPage />,
      },
    ],
  },
]);
