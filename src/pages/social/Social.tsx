import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Users } from 'lucide-react';
import { PageHeroSection } from '@/components';
import { SocialFeed, LocalMarket } from '@/features/social';

export const Social = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'community' | 'local-market'>('community');

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeroSection
        title={t('social.title')}
        subtitle={t('social.subtitle')}
      >
        <div className="w-full max-w-xl rounded-2xl bg-white/20 p-1.5 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'community'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <Users className="h-4 w-4" />
              {t('social.tabs.community')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('local-market')}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'local-market'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <Store className="h-4 w-4" />
              {t('social.tabs.localMarket')}
            </button>
          </div>
        </div>
      </PageHeroSection>

      <section className="px-4 py-5 sm:px-6">
        {activeTab === 'community' ? <SocialFeed /> : <LocalMarket />}
      </section>
    </div>
  );
};