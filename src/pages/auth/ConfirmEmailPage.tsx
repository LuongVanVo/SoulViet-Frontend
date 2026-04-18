import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { authApi } from '@/services';

type VerifyStatus = 'loading' | 'success' | 'error';

export default function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [error, setError] = useState('');

  const token = useMemo(
    () => searchParams.get('token') || searchParams.get('code') || '',
    [searchParams]
  );

  const email = useMemo(
    () => searchParams.get('email') || searchParams.get('userEmail') || undefined,
    [searchParams]
  );

  useEffect(() => {
    let isActive = true;

    async function verifyEmail() {
      if (!token) {
        if (isActive) {
          setStatus('error');
          setError(t('auth.confirmEmail.missingToken'));
        }
        return;
      }

      try {
        await authApi.confirmEmail(token, email);

        if (isActive) {
          setStatus('success');
        }
      } catch (err: unknown) {
        if (!isActive) return;

        let message = t('auth.confirmEmail.failed');
        const data = (err as { response?: { data?: { message?: string; detail?: string } | string } })
          ?.response?.data;

        if (typeof data === 'string' && data.trim()) {
          message = data;
        } else if (data && typeof data === 'object') {
          if (data.message) message = data.message;
          else if (data.detail) message = data.detail;
        }

        setStatus('error');
        setError(message);
      }
    }

    verifyEmail();

    return () => {
      isActive = false;
    };
  }, [token, email, t]);

  return (
    <AuthShell
      title={t('auth.confirmEmail.title')}
      subtitle={t('auth.confirmEmail.subtitle')}
      activeMode="login"
      showModeTabs={false}
    >
      {status === 'loading' && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <p className="text-sm font-medium">{t('auth.confirmEmail.loading')}</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">{t('auth.confirmEmail.successTitle')}</p>
              <p className="mt-1 text-sm">{t('auth.confirmEmail.successDescription')}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">{t('auth.confirmEmail.errorTitle')}</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft"
        >
          {t('auth.confirmEmail.backToLogin')}
        </Link>

        <Link
          to="/register"
          className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          {t('auth.confirmEmail.backToRegister')}
        </Link>
      </div>
    </AuthShell>
  );
}
