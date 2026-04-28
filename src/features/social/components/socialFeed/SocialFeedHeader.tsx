import { useTranslation } from 'react-i18next';

export const SocialFeedHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 px-4 sm:px-0">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {t('social.feed.header.title')}
      </h1>
      <p className="mt-1 text-sm text-gray-500 sm:text-base">
        {t('social.feed.header.subtitle')}
      </p>
    </div>
  );
};
