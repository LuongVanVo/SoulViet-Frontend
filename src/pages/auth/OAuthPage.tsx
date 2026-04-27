import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { AuthShell } from './AuthShell';

export default function OAuthPage() {
  const { t } = useTranslation();

  const formContent = (
    <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-black/5">
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
          {t('auth.oauth.title')}
        </h1>
        <p className="text-[13px] text-gray-500 font-medium">
          {t('auth.oauth.subtitle')}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <LoaderCircle className="h-10 w-10 text-[#0D5C46] animate-spin mb-4" />
        <p className="text-[13px] font-bold text-gray-700">{t('auth.oauth.connecting')}</p>
      </div>

      <div className="mt-8 flex justify-center">
        <Link to="/login" className="flex items-center gap-2 text-[11px] font-bold text-[#0D5C46] hover:underline">
          <ArrowRight className="h-3 w-3 rotate-180" />
          {t('auth.oauth.backToSignIn')}
        </Link>
      </div>
    </div>
  );

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1542640244-7e672d6cb466?q=80&w=1000&auto=format&fit=crop"
      imageTitle={t('auth.oauth.title')}
      imageTitleUnderline="green"
      reverse={true}
      formBg="cream"
    >
      {formContent}
    </AuthShell>
  );
}
