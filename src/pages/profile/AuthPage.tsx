import { useTranslation } from 'react-i18next';
import type { UserProfile } from '../../types';
import SignInPage from '../auth/SignInPage';
import SignUpPage from '../auth/SignUpPage';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  authMode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
  onAuthSuccess?: (user: UserProfile) => void;
}

export const AuthPage = ({ authMode, onChangeMode, onAuthSuccess }: AuthPageProps) => {
  const { t } = useTranslation();

  function handleModeChange(nextMode: AuthMode): void {
    if (nextMode === authMode) return;

    onChangeMode(nextMode);
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
          <SignInPage
            embedded
            onAuthSuccess={onAuthSuccess}
            onSwitchToSignUp={() => handleModeChange('register')}
          />
        )}

        {authMode === 'register' && (
          <SignUpPage
            embedded
            onSwitchToSignIn={() => handleModeChange('login')}
          />
        )}
      </div>
    </section>
  );
};