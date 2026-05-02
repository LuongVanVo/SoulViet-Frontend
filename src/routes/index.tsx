import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
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
  PostDetailPage,
  PublicProfilePage,
  CartPage,
  NotificationPage,
} from '@/pages';
import { PreviewOrderPage } from '@/pages/checkout';

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
        path: 'posts/:postId',
        element: <PostDetailPage />,
      },
      {
        path: 'marketplace',
        element: <MarketPlace />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout/preview',
        element: <PreviewOrderPage />,
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
        path: 'profile/:userId',
        element: <PublicProfilePage />,
      },
      {
        path: 'notifications',
        element: <NotificationPage />,
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
