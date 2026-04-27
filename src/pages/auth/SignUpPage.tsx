import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import { authApi } from '@/services';
import {
  doPasswordsMatch,
  getPasswordMatchMessage,
  getPasswordValidationMessage,
  getValidationEmailMessage,
  isValidInput,
  isValidPassword,
} from '@/utils/validation';
import { AuthShell } from './AuthShell';

interface SignUpPageProps {
  embedded?: boolean;
  onSwitchToSignIn?: () => void;
}

export default function SignUpPage({ embedded = false, onSwitchToSignIn }: SignUpPageProps) {
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
      await authApi.register({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        confirmPassword,
      });

      authApi.clearTokens();
      navigate('/verify-email-notice', { state: { email: email.trim() } });
    } catch (err: unknown) {
      let message = t('profile.auth.errors.registerFailed');

      if (axios.isAxiosError(err)) {
        if (!err.response) {
          message = t('profile.auth.errors.networkError');
        } else {
          const data = err.response.data as
            | {
              message?: string;
              detail?: string;
              title?: string;
              errors?: Record<string, string[]>;
              [key: string]: unknown;
            }
            | string
            | undefined;

          if (typeof data === 'string') {
            message = data.includes('<!DOCTYPE') ? t('profile.auth.errors.serverError') : data;
          } else if (data && typeof data === 'object') {
            if (data.message && typeof data.message === 'string') {
              message = data.message;
            } else if (data.detail && typeof data.detail === 'string') {
              message = data.detail;
            } else if (data.title && typeof data.title === 'string') {
              message = data.title;
            } else if (data.errors && typeof data.errors === 'object') {
              for (const value of Object.values(data.errors)) {
                if (Array.isArray(value) && value.length > 0) {
                  message = value[0];
                  break;
                }
              }
            } else {
              for (const value of Object.values(data)) {
                if (Array.isArray(value) && value.length > 0) {
                  message = String(value[0]);
                  break;
                }
                if (typeof value === 'string') {
                  message = value;
                  break;
                }
              }
            }
          }
        }
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
          {t('auth.signUp.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.signUp.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 animate-in shake duration-500">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signUp.nameLabel')}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
              placeholder={t('auth.signUp.namePlaceholder')}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signUp.emailLabel')}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
              placeholder={t('auth.signUp.emailPlaceholder')}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signUp.passwordLabel')}
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
              placeholder={t('auth.signUp.passwordPlaceholder')}
              required
            />
          </div>
          {getPasswordValidationMessage(password) && (
            <p className="px-4 text-[10px] text-red-500 font-medium">
              {t(getPasswordValidationMessage(password))}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-900 ml-1">
            {t('auth.signUp.confirmPasswordLabel')}
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
              placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
              required
            />
          </div>
          {getPasswordMatchMessage(password, confirmPassword) && (
            <p className="px-4 text-[10px] text-red-500 font-medium">
              {t(getPasswordMatchMessage(password, confirmPassword))}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#0D5C46] px-6 py-4 text-[13.5px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98] disabled:opacity-70 mt-4"
        >
          {loading ? (
            <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            t('auth.signUp.signUpButton')
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-[11px] font-medium text-gray-400">
          {t('auth.signUp.continueWith')}
        </span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[12px] font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
        {t('auth.signUp.signUpWithGoogle')}
      </button>

      <p className="mt-8 text-center text-[13px] font-medium text-gray-500">
        {t('auth.signUp.haveAccount')}{' '}
        {embedded && onSwitchToSignIn ? (
          <button type="button" onClick={onSwitchToSignIn} className="font-medium text-[#0D5C46] hover:underline">
            {t('auth.signUp.login')}
          </button>
        ) : (
          <Link to="/login" className="font-bold text-[#0D5C46] hover:underline">
            {t('auth.signUp.login')}
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
      image="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop"
      imageTitle={t('auth.signUp.heroText')}
      imageSubtitle={t('auth.signUp.heroSubText')}
      imageTitleUnderline="white"
      reverse={false}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
