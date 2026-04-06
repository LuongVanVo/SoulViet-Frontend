import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/auth.api';
import { userApi } from '../../services/user.api';
import { getValidationMessage, isValidInput } from '../../utils/validation';
import type { UserProfile } from '../../types';
import { AuthShell } from './AuthShell';

interface SignInPageProps {
  embedded?: boolean;
  onAuthSuccess?: (user: UserProfile) => void;
  onSwitchToSignUp?: () => void;
}

export default function SignInPage({ embedded = false, onAuthSuccess, onSwitchToSignUp }: SignInPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        username: emailOrUsername.trim(),
        password,
      });

      const token = response.accessToken || response.access;
      if (token) {
        authApi.setToken(token);
      }
      if (response.refresh) {
        authApi.setRefreshToken(response.refresh);
      }

      const user = await userApi.getCurrentUser();

      if (onAuthSuccess && user) {
        onAuthSuccess(user);
      } else {
        navigate('/profile');
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

  const content = (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.signIn.emailLabel')}</label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(event) => setEmailOrUsername(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signIn.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-600">{t('auth.signIn.passwordLabel')}</label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                {t('auth.signIn.forgotPassword')}
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signIn.passwordPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isValidInput(emailOrUsername)}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
          >
            {loading ? t('profile.auth.form.loadingLogin') : t('auth.signIn.loginButton')}
          </button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">{t('auth.signIn.continueWith')}</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Link
        to="/oauth2"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        {t('auth.signIn.loginWithGoogle')}
      </Link>

      <p className="mt-5 text-center text-sm text-gray-500">
        {t('auth.signIn.noAccount')}{' '}
        {embedded ? (
          <button type="button" onClick={onSwitchToSignUp} className="font-semibold text-primary hover:underline">
            {t('auth.signIn.signUp')}
          </button>
        ) : (
          <Link to="/register" className="font-semibold text-primary hover:underline">
            {t('auth.signIn.signUp')}
          </Link>
        )}
      </p>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <AuthShell
      title={t('profile.auth.loginTitle')}
      subtitle={t('profile.auth.loginSubtitle')}
      activeMode="login"
    >
      {content}
    </AuthShell>
  );
}
