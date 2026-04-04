import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { authApi } from '../../services/auth.api';
import { userApi } from '../../services/user.api';
import {
  doPasswordsMatch,
  getPasswordMatchMessage,
  getPasswordValidationMessage,
  getValidationEmailMessage,
  getValidationMessage,
  isValidInput,
  isValidPassword,
} from '../../utils/validation';
import type { UserProfile } from '../../types';

type AuthMode = 'login' | 'register';

interface AuthProfilePageProps {
  authMode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  onAuthSuccess?: (user: UserProfile) => void;
}

export const AuthProfilePage = ({ authMode, onChangeMode, onAuthSuccess }: AuthProfilePageProps) => {
  const { t } = useTranslation();

  const [emailOrUsername, setEmailOrUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>('');

  function handleModeChange(nextMode: AuthMode): void {
    if (nextMode === authMode) return;

    onChangeMode(nextMode);
    setLoginError('');
    setRegisterError('');
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!isValidInput(emailOrUsername)) {
      setLoginError(getValidationMessage(emailOrUsername));
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const payload = {
        username: emailOrUsername.trim(),
        password: loginPassword,
      };

      const res = await authApi.login(payload);

      const token = res.accessToken || res.access;
      if (token) {
        authApi.setToken(token);
      }
      if (res.refresh) {
        authApi.setRefreshToken(res.refresh);
      }

      const user = await userApi.getCurrentUser();

      setEmailOrUsername('');
      setLoginPassword('');

      if (user && onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err: unknown) {
      let msg = t('profile.auth.errors.loginFailed');

      const error = err as {
        response?: {
          data?: {
            detail?: string;
            non_field_errors?: string | string[];
            username?: string | string[];
            password?: string | string[];
            message?: string;
          } & (string | object);
        };
      };

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          msg = data.includes('<!DOCTYPE') ? t('profile.auth.errors.serverError') : data;
        } else if (typeof data === 'object') {
          if (data.message) {
            msg = data.message;
          } else if (data.detail) {
            msg = data.detail;
          } else if (data.non_field_errors) {
            msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
          } else if (data.username) {
            msg = Array.isArray(data.username) ? data.username[0] : data.username;
          } else if (data.password) {
            msg = Array.isArray(data.password) ? data.password[0] : data.password;
          }
        }
      }

      setLoginError(msg);
      console.error('Login error:', error.response?.data || err);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!isValidInput(registerEmail) || getValidationEmailMessage(registerEmail)) {
      const validationKey = getValidationEmailMessage(registerEmail) || 'profile.auth.errors.invalidEmail';
      setRegisterError(t(validationKey));
      return;
    }

    if (!isValidInput(fullName)) {
      setRegisterError(t('profile.auth.errors.fullNameRequired'));
      return;
    }

    if (!doPasswordsMatch(registerPassword, confirmPassword)) {
      setRegisterError(t('profile.auth.errors.passwordMismatch'));
      return;
    }

    if (!isValidPassword(registerPassword)) {
      setRegisterError(t('profile.auth.errors.passwordTooShort'));
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');

    try {
      const payload = {
        email: registerEmail.trim(),
        fullName: fullName.trim(),
        password: registerPassword,
        confirmPassword: confirmPassword,
      };

      const res = await authApi.register(payload);

      const token = res.accessToken || res.access;
      if (token) {
        authApi.setToken(token);
      }
      if (res.refresh) {
        authApi.setRefreshToken(res.refresh);
      }

      const user = await userApi.getCurrentUser();

      setRegisterEmail('');
      setFullName('');
      setRegisterPassword('');
      setConfirmPassword('');

      if (user && onAuthSuccess) {
        onAuthSuccess(user);
      }
    } catch (err: unknown) {
      let msg = t('profile.auth.errors.registerFailed');

      const error = err as {
        response?: { data?: Record<string, string | string[]> | string };
      };

      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          msg = data.includes('<!DOCTYPE') ? t('profile.auth.errors.serverError') : data;
        } else if (typeof data === 'object') {
          for (const value of Object.values(data)) {
            if (Array.isArray(value) && value.length > 0) {
              msg = value[0];
              break;
            }
            if (typeof value === 'string') {
              msg = value;
              break;
            }
          }
        }
      }

      setRegisterError(msg);
      console.error('Register error:', error.response?.data || err);
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <section className="px-4 pb-6 sm:px-6">
      <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-soft">
        <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              authMode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            {t('profile.auth.form.loginTab')}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              authMode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
            }`}
          >
            {t('profile.auth.form.registerTab')}
          </button>
        </div>

        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            {loginError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{loginError}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.emailLabel')}
              </label>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.emailPlaceholder')}
                required
              />
              {getValidationMessage(emailOrUsername) && (
                <p className="text-xs text-red-500 mt-1">{t(getValidationMessage(emailOrUsername))}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.passwordLabel')}
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.passwordPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || !isValidInput(emailOrUsername)}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
            >
              {loginLoading ? t('profile.auth.form.loadingLogin') : t('profile.auth.form.loginAction')}
            </button>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            {registerError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{registerError}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.emailLabel')}
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.emailPlaceholder')}
                required
              />
              {getValidationEmailMessage(registerEmail) && (
                <p className="text-xs text-red-500 mt-1">{t(getValidationEmailMessage(registerEmail))}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.fullNameLabel')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.fullNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.passwordLabel')}
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.passwordPlaceholder')}
                required
              />
              {getPasswordValidationMessage(registerPassword) && (
                <p className="text-xs text-red-500 mt-1">{t(getPasswordValidationMessage(registerPassword))}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('profile.auth.form.confirmPasswordLabel')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder={t('profile.auth.form.passwordPlaceholder')}
                required
              />
              {getPasswordMatchMessage(registerPassword, confirmPassword) && (
                <p className="text-xs text-red-500 mt-1">{t(getPasswordMatchMessage(registerPassword, confirmPassword))}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
            >
              {registerLoading ? t('profile.auth.form.loadingRegister') : t('profile.auth.form.registerAction')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};