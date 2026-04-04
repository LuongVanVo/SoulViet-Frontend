import { useTranslation } from 'react-i18next';
import { PageHeroSection } from '../components/layout/PageHeroSection';

export const Map = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeroSection
        title={t('map.title')}
        subtitle={t('map.subtitle')}
      />
    </div>
  );
};