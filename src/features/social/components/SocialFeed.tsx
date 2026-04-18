import { useTranslation } from 'react-i18next';

export const SocialFeed = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-soft">
        <p className="text-lg font-bold text-text-dark">{t('social.feed.title')}</p>
        <p className="mt-2 text-sm text-gray-500">{t('social.feed.description')}</p>
      </div>
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-5 text-sm text-gray-500">
        {t('social.feed.placeholder')}
      </div>
    </div>
  );
};