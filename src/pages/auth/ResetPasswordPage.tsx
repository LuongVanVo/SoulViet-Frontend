import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '@/services';
import { AuthShell } from './AuthShell';
import { isValidPassword, doPasswordsMatch, getPasswordValidationMessage, getPasswordMatchMessage } from '@/utils/validation';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError(t('auth.confirmEmail.missingToken'));
    }
  }, [token, email, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !email) return;

    if (!isValidPassword(password)) {
      setError(t('profile.auth.errors.passwordTooShort'));
      return;
    }

    if (!doPasswordsMatch(password, confirmPassword)) {
      setError(t('profile.auth.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.resetPassword({
        email,
        token,
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('profile.auth.errors.serverError'));
    } finally {
      setLoading(false);
    }
  }

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.resetPassword.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.resetPassword.subtitle')}
        </p>
      </div>

      {success ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <p className="text-[14px] font-medium text-emerald-800 px-4">
            {t('auth.resetPassword.successMessage')}
          </p>
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-full bg-[#0D5C46] px-6 py-4 text-[13.5px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98]"
          >
            {t('auth.resetPassword.backToLogin')}
          </Link>
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
              {t('auth.resetPassword.passwordLabel')}
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
                placeholder={t('auth.resetPassword.passwordPlaceholder')}
                required
              />
            </div>
            {password && getPasswordValidationMessage(password) && (
              <p className="px-4 text-[10px] text-red-500 font-medium">
                {t(getPasswordValidationMessage(password))}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-900 ml-1">
              {t('auth.resetPassword.confirmPasswordLabel')}
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
                placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                required
              />
            </div>
            {confirmPassword && getPasswordMatchMessage(password, confirmPassword) && (
              <p className="px-4 text-[10px] text-red-500 font-medium">
                {t(getPasswordMatchMessage(password, confirmPassword))}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token || !email}
            className="w-full rounded-full bg-[#0D5C46] px-6 py-4 text-[13.5px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {loading ? (
              <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              t('auth.resetPassword.resetButton')
            )}
          </button>
        </form>
      )}

      {!success && (
        <div className="mt-8 flex justify-center">
          <Link to="/login" className="flex items-center gap-2 text-[13px] font-medium text-[#0D5C46] hover:underline">
            <ArrowRight className="h-3 w-3 rotate-180" />
            {t('auth.resetPassword.backToLogin')}
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1603852452378-a4e8d84324a2?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      imageTitle={t('auth.resetPassword.title')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
