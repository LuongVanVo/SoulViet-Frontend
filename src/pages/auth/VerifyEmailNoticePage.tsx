import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MailCheck } from 'lucide-react';
import { AuthShell } from './AuthShell';

interface VerifyEmailLocationState {
  email?: string;
}

export default function VerifyEmailNoticePage() {
  const { t } = useTranslation();
  const location = useLocation();

  const email = (location.state as VerifyEmailLocationState | null)?.email;

  return (
    <AuthShell
      title={t('auth.verifyEmail.title')}
      subtitle={t('auth.verifyEmail.subtitle')}
      activeMode="register"
      showModeTabs={false}
    >
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-emerald-100 p-2">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t('auth.verifyEmail.sentTitle')}</p>
            <p className="mt-1 text-sm">
              {email
                ? t('auth.verifyEmail.sentDescriptionWithEmail', { email })
                : t('auth.verifyEmail.sentDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft"
        >
          {t('auth.verifyEmail.openGmail')}
        </a>

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {t('auth.verifyEmail.backToLogin')}
        </Link>
      </div>

      <p className="mt-5 text-center text-sm text-gray-500">{t('auth.verifyEmail.tip')}</p>
    </AuthShell>
  );
}
