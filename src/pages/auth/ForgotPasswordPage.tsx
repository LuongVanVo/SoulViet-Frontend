import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthShell } from './AuthShell';
import { authApi } from '../../services/auth.api';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setSent(false);
    setError('');

    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      setError(t('profile.auth.errors.serverError'));
    } finally {
      setLoading(false);
    }
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
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

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
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft"
        >
          {loading ? t('auth.forgotPassword.sendingButton') : t('auth.forgotPassword.sendButton')}
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
