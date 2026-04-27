import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { MyPost } from '@/pages/profile/MyPost';
import { 
  HomePage,
  Map, 
  AIPlan, 
  Social, 
  Profile,
  ConfirmEmailPage, 
  ForgotPasswordPage, 
  OAuthPage, 
  SignInPage, 
  SignUpPage, 
  VerifyEmailNoticePage,
  ResetPasswordPage
} from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
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
        path: 'profile/my-posts',
        element: <MyPost />,
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
        path: 'reset-password',
        element: <ResetPasswordPage />,
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
