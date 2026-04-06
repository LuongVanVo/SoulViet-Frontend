import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/auth.api';
import { userApi } from '../../services/user.api';
import {
  doPasswordsMatch,
  getPasswordMatchMessage,
  getPasswordValidationMessage,
  getValidationEmailMessage,
  isValidInput,
  isValidPassword,
} from '../../utils/validation';
import type { UserProfile } from '../../types';
import { AuthShell } from './AuthShell';

interface SignUpPageProps {
  embedded?: boolean;
  onAuthSuccess?: (user: UserProfile) => void;
  onSwitchToSignIn?: () => void;
}

export default function SignUpPage({ embedded = false, onAuthSuccess, onSwitchToSignIn }: SignUpPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!isValidInput(email) || getValidationEmailMessage(email)) {
      const validationKey = getValidationEmailMessage(email) || 'profile.auth.errors.invalidEmail';
      setError(t(validationKey));
      return;
    }

    if (!isValidInput(fullName)) {
      setError(t('profile.auth.errors.fullNameRequired'));
      return;
    }

    if (!doPasswordsMatch(password, confirmPassword)) {
      setError(t('profile.auth.errors.passwordMismatch'));
      return;
    }

    if (!isValidPassword(password)) {
      setError(t('profile.auth.errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        confirmPassword,
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
      let message = t('profile.auth.errors.registerFailed');
      const errorData = err as {
        response?: {
          data?: Record<string, string | string[]> | string;
        };
      };

      const data = errorData.response?.data;
      if (typeof data === 'string') {
        message = data.includes('<!DOCTYPE') ? t('profile.auth.errors.serverError') : data;
      } else if (data && typeof data === 'object') {
        for (const value of Object.values(data)) {
          if (Array.isArray(value) && value.length > 0) {
            message = value[0];
            break;
          }
          if (typeof value === 'string') {
            message = value;
            break;
          }
        }
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
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.signUp.nameLabel')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signUp.namePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.signUp.emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signUp.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.signUp.passwordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signUp.passwordPlaceholder')}
              required
            />
            {getPasswordValidationMessage(password) && (
              <p className="mt-1 text-xs text-red-500">{t(getPasswordValidationMessage(password))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.signUp.confirmPasswordLabel')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
              required
            />
            {getPasswordMatchMessage(password, confirmPassword) && (
              <p className="mt-1 text-xs text-red-500">{t(getPasswordMatchMessage(password, confirmPassword))}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
          >
            {loading ? t('profile.auth.form.loadingRegister') : t('auth.signUp.signUpButton')}
          </button>
      </form>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">{t('auth.signUp.continueWith')}</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Link
        to="/oauth2"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        {t('auth.signUp.loginWithGoogle')}
      </Link>

      <p className="mt-5 text-center text-sm text-gray-500">
        {t('auth.signUp.haveAccount')}{' '}
        {embedded ? (
          <button type="button" onClick={onSwitchToSignIn} className="font-semibold text-primary hover:underline">
            {t('auth.signUp.login')}
          </button>
        ) : (
          <Link to="/login" className="font-semibold text-primary hover:underline">
            {t('auth.signUp.login')}
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
      title={t('profile.auth.registerTitle')}
      subtitle={t('profile.auth.registerSubtitle')}
      activeMode="register"
    >
      {content}
    </AuthShell>
  );
}
