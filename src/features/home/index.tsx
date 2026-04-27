import { useTranslation } from 'react-i18next';
import { HeroSection } from '@/features/home/components/HeroSection';
import { ProductSection } from '@/features/home/components/ProductSection';
import { StoriesSection } from '@/features/home/components/StoriesSection';

export const HomeFeature = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-20 pb-6 md:space-y-24 lg:space-y-28">
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 sm:pt-40 md:pt-20 lg:px-8 lg:pt-24">
        <div className="space-y-20 md:space-y-24">
          <ProductSection heading={t('productSection.heading')} subheading={t('productSection.subheading')} />
          <StoriesSection heading={t('storiesSection.heading')} subheading={t('storiesSection.subheading')} />
        </div>
      </section>
    </div>
  );
};

export * from './components';