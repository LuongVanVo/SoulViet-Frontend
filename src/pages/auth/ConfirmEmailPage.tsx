import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, LoaderCircle, XCircle, ArrowRight } from 'lucide-react';
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

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.confirmEmail.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.confirmEmail.subtitle')}
        </p>
      </div>

      <div className="mb-8 animate-in fade-in duration-500">
        {status === 'loading' && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-blue-800">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <LoaderCircle className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-[13px] font-medium">{t('auth.confirmEmail.loading')}</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1">{t('auth.confirmEmail.successTitle')}</p>
                <p className="text-xs font-medium text-emerald-700/80">{t('auth.confirmEmail.successDescription')}</p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
            <div className="flex flex-col items-center text-center gap-3">
              <div>
                <p className="text-[13px] font-medium mb-1">{t('auth.confirmEmail.errorTitle')}</p>
                <p className="text-xs font-medium text-red-700/80">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-full bg-[#0D5C46] px-6 py-4 text-[13px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98]"
        >
          {t('auth.confirmEmail.backToLogin')}
        </Link>

        {status === 'error' && (
          <div className="mt-8 flex justify-center">
            <Link to="/register" className="flex items-center gap-2 text-[12px] font-medium text-[#0D5C46] hover:underline">
              <ArrowRight className="h-3 w-3 rotate-180" />
              {t('auth.confirmEmail.backToRegister')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AuthShell
      image=" https://images.unsplash.com/photo-1698575947237-8b5dd6f1fa94?q=80&w=781&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      imageTitle={t('auth.confirmEmail.title')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
