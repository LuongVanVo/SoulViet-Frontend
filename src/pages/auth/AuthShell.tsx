import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeroSection } from '@/components';

type AuthMode = 'login' | 'register';

interface AuthShellProps {
  title: string;
  subtitle: string;
  activeMode: AuthMode;
  showModeTabs?: boolean;
  children: ReactNode;
}

export const AuthShell = ({ title, subtitle, activeMode, showModeTabs = true, children }: AuthShellProps) => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-500 space-y-5">
      <PageHeroSection title={title} subtitle={subtitle} />

      <section className="px-4 pb-6 sm:px-6">
        <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-soft">
          {showModeTabs && (
            <div className="inline-flex rounded-xl bg-gray-100 p-1 mb-5">
              <Link
                to="/login"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeMode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
                }`}
              >
                {t('profile.auth.form.loginTab')}
              </Link>
              <Link
                to="/register"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activeMode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
                }`}
              >
                {t('profile.auth.form.registerTab')}
              </Link>
            </div>
          )}

          {children}
        </div>
      </section>
    </div>
  );
};
