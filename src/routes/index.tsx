import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { MyPost } from '@/pages/profile/MyPost';
import { 
  HomePage,
  Map, 
  AIPlan, 
  Social,
  MarketPlace, 
  Profile,
  ConfirmEmailPage, 
  ForgotPasswordPage, 
  OAuthPage, 
  SignInPage, 
  SignUpPage, 
  VerifyEmailNoticePage,
  ResetPasswordPage,
  MarketplaceProductDetailPage,
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
        path: 'marketplace',
        element: <MarketPlace />,
      },
      {
        path: 'marketplace/:productId',
        element: <MarketplaceProductDetailPage />,
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
