import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthShell } from './AuthShell';

export default function OAuthPage() {
  const { t } = useTranslation();

  return (
    <AuthShell
      title={t('auth.oauth.title')}
      subtitle={t('auth.oauth.subtitle')}
      activeMode="login"
    >
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        {t('auth.oauth.googleButton')}
      </button>

      <p className="mt-5 text-center text-sm text-gray-500">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t('auth.oauth.backToSignIn')}
        </Link>
      </p>
    </AuthShell>
  );
}
