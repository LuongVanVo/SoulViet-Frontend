import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { PageHeroSection } from '../../../components/layout/PageHeroSection';
import { SearchInput } from '../../../components/ui/SearchInput';
import { VibeTag } from '../../../components/ui/VibeTag';
import { apiService } from '../../../services/mockData';
import type { VibeTag as VibeTagType } from '../../../types';

export const HeroSection = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<VibeTagType[]>([]);

  useEffect(() => {
    apiService.getVibeTags().then(setTags);
  }, []);

  return (
    <div>
      <PageHeroSection
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        badge={
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current" />
            <span>1,247 SC</span>
          </div>
        }
      >
        <div className="w-full">
          <SearchInput className="mt-0 w-full" />
        </div>
      </PageHeroSection>

      <div className="mt-5 flex flex-row overflow-x-auto gap-2.5 px-5 sm:gap-3 sm:px-8 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tags.map((tag) => (
          <VibeTag key={tag.id} tag={tag} variant="hero" className="badge-no-shrink" />
        ))}
      </div>
    </div>
  );
};
