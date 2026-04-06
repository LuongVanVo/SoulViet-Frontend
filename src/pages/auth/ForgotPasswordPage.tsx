import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthShell } from './AuthShell';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSent(true);
  }

  return (
    <AuthShell
      title={t('auth.forgotPassword.title')}
      subtitle={t('auth.forgotPassword.subtitle')}
      activeMode="login"
      showModeTabs={false}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {sent && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{t('auth.forgotPassword.successMessage')}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.forgotPassword.emailLabel')}</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft"
        >
          {t('auth.forgotPassword.sendButton')}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        {t('auth.forgotPassword.rememberPassword')}{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </p>
    </AuthShell>
  );
}
