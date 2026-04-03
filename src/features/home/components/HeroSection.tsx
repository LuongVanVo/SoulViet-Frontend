import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../components/ui/SearchInput';
import { VibeTag } from '../../../components/ui/VibeTag';
import { apiService } from '../../../services/mockData';
import type { VibeTag as VibeTagType } from '../../../types';
import { Star } from 'lucide-react';

export const HeroSection = () => {
  const { t } = useTranslation();
  const [tags, setTags] = useState<VibeTagType[]>([]);

  useEffect(() => {
    apiService.getVibeTags().then(setTags);
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden rounded-b-4xl bg-[linear-gradient(135deg,_#1A4B8E_0%,_#1d7a63_100%)] text-white shadow-lg px-6 pt-15 pb-8 sm:px-8 sm:pt-8 sm:pb-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,#ffffff26_0_2px,transparent_2.5px),radial-gradient(circle_at_75%_20%,#ffffff1c_0_2px,transparent_2.5px),radial-gradient(circle_at_55%_70%,#ffffff20_0_2px,transparent_2.5px)] bg-size-[160px_120px] opacity-20" />

        <div className="absolute right-4 top-15 rounded-full bg-secondary-alt px-4 py-2 text-sm font-bold text-text-darker shadow-md sm:right-8 sm:top-8 sm:px-5 sm:py-2.5">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-current" />
            <span>1,247 SC</span>
          </div>
        </div>

        <div className="relative max-w-3xl pr-0 sm:pr-36">
          <h2 className="text-[1.25rem] sm:text-[2rem] font-semibold leading-tight text-white mb-1.5">{t('home.title')}</h2>
          <p className="mt-1 text-base sm:text-lg font-medium text-text-hero-subtitle mb-6">{t('home.subtitle')}</p>

          <div className="w-full">
            <SearchInput className="mt-0 w-full" />
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-row overflow-x-auto gap-2.5 px-5 sm:gap-3 sm:px-8 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tags.map((tag) => (
          <VibeTag key={tag.id} tag={tag} variant="hero" className="badge-no-shrink" />
        ))}
      </div>
    </div>
  );
};
