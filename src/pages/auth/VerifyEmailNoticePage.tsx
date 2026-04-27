import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MailCheck, ArrowRight } from 'lucide-react';
import { AuthShell } from './AuthShell';

interface VerifyEmailLocationState {
  email?: string;
}

export default function VerifyEmailNoticePage() {
  const { t } = useTranslation();
  const location = useLocation();

  const email = (location.state as VerifyEmailLocationState | null)?.email;

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.verifyEmail.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-normal">
          {t('auth.verifyEmail.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800 mb-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="rounded-full bg-emerald-100 p-3">
            <MailCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[13px] font-medium mb-1">{t('auth.verifyEmail.sentTitle')}</p>
            <p className="text-xs font-medium text-emerald-700/80">
              {email
                ? t('auth.verifyEmail.sentDescriptionWithEmail', { email })
                : t('auth.verifyEmail.sentDescription')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center rounded-full bg-[#0D5C46] px-6 py-4 text-[12px] font-medium text-white shadow-lg shadow-[#0D5C46]/20 transition-transform active:scale-[0.98]"
        >
          {t('auth.verifyEmail.openGmail')}
        </a>

        <div className="mt-8 flex justify-center">
          <Link to="/login" className="flex items-center gap-2 text-[12px] font-medium text-[#0D5C46] hover:underline">
            <ArrowRight className="h-3 w-3 rotate-180" />
            {t('auth.verifyEmail.backToLogin')}
          </Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs font-medium text-gray-400">{t('auth.verifyEmail.tip')}</p>
    </div>
  );

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1568775791746-bcc117bcb312?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      imageTitle={t('auth.verifyEmail.title')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
