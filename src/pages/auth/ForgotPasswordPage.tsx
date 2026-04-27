import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { authApi } from '@/services';

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

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.forgotPassword.subtitle')}
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-100 animate-in fade-in duration-500">
          <p className="text-[13px] font-medium text-emerald-800">
            {t('auth.forgotPassword.successMessage')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100 animate-in shake duration-500">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 ml-1">
              {t('auth.forgotPassword.emailLabel')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-full bg-[#FDF8F4] border-none px-12 py-3.5 text-[13px] outline-none focus:ring-2 focus:ring-[#0D5C46]/20 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0D5C46] px-6 py-4 text-[13.5px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              t('auth.forgotPassword.sendButton')
            )}
          </button>
        </form>
      )}

      <div className="mt-8 flex justify-center">
        <Link to="/login" className="flex items-center gap-2 text-[13px] font-medium text-[#0D5C46] hover:underline">
          <ArrowRight className="h-3 w-3 rotate-180" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </div>
    </div>
  );

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1681350351313-fa88f209607a?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      imageTitle={t('auth.forgotPassword.title')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
