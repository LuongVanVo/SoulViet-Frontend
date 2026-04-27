import { useState, type SubmitEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { authApi, userApi } from '@/services';
import { getValidationMessage, isValidInput } from '@/utils/validation';
import type { UserProfile } from '@/types';
import { AuthShell } from './AuthShell';
import { useAuthStore } from '@/store';

interface SignInPageProps {
  embedded?: boolean;
  onAuthSuccess?: (user: UserProfile) => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInPage({ embedded = false, onAuthSuccess, onSwitchToSignUp }: SignInPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!isValidInput(emailOrUsername)) {
      setError(t(getValidationMessage(emailOrUsername)));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({
        email: emailOrUsername.trim(),
        password,
      });

      const token = response.accessToken || response.access || response.token;
      if (token) {
        authApi.setToken(token);
      }

      const refreshToken = response.refreshToken || response.refresh;
      if (refreshToken) {
        authApi.setRefreshToken(refreshToken);
      }

      const user = await userApi.getCurrentUser();
      if (user) {
        setUser(user);
      }

      if (onAuthSuccess && user) {
        onAuthSuccess(user);
      } else {
        const redirectParam = new URLSearchParams(location.search).get('redirect');
        const nextPath = redirectParam ? decodeURIComponent(redirectParam) : '/profile';
        navigate(nextPath, { replace: true });
      }
    } catch (err: unknown) {
      const unknownMessage = t('profile.auth.errors.loginFailed');
      const errorData = err as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            non_field_errors?: string | string[];
            username?: string | string[];
            password?: string | string[];
          } | string;
        };
      };

      let message = unknownMessage;
      const data = errorData.response?.data;

      if (typeof data === 'string') {
        message = data.includes('<!DOCTYPE') ? t('profile.auth.errors.serverError') : data;
      } else if (data && typeof data === 'object') {
        if (data.message) message = data.message;
        else if (data.detail) message = data.detail;
        else if (data.non_field_errors) message = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        else if (data.username) message = Array.isArray(data.username) ? data.username[0] : data.username;
        else if (data.password) message = Array.isArray(data.password) ? data.password[0] : data.password;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.signIn.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.signIn.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 animate-in shake duration-500">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signIn.emailLabel')}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
              placeholder={t('auth.signIn.emailPlaceholder')}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signIn.passwordLabel')}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
              placeholder={t('auth.signIn.passwordPlaceholder')}
              required
            />
          </div>
          <div className="flex justify-end pt-1">
            <Link to="/forgot-password" className="text-[12px] font-medium text-[#0D5C46] hover:underline">
              {t('auth.signIn.forgotPassword')}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isValidInput(emailOrUsername)}
          className="w-full rounded-full bg-[#0D5C46] px-6 py-4 text-[13.5px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98] disabled:opacity-70 mt-2"
        >
          {loading ? (
            <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            t('auth.signIn.loginButton')
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-medium text-gray-400">
          {t('auth.signIn.continueWith')}
        </span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[12px] font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
        {t('auth.signIn.loginWithGoogle')}
      </button>

      <p className="mt-8 text-center text-[13px] font-medium text-gray-500">
        {t('auth.signIn.noAccount')}{' '}
        {embedded && onSwitchToSignUp ? (
          <button type="button" onClick={onSwitchToSignUp} className="font-medium text-[#0D5C46] hover:underline">
            {t('auth.signIn.signUp')}
          </button>
        ) : (
          <Link to="/register" className="font-bold text-[#0D5C46] hover:underline">
            {t('auth.signIn.signUp')}
          </Link>
        )}
      </p>
    </div>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1755657763706-cb23214f2d0e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      imageTitle={t('auth.signIn.heroText', 'Khám phá văn hóa đích thực')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
