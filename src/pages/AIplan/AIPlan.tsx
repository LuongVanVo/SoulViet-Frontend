import { useTranslation } from 'react-i18next';
import { PageHeroSection } from '@/components';

export const AIPlan = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeroSection
        title={t('aiPlan.title')}
        subtitle={t('aiPlan.subtitle')}
      />
    </div>
  );
};