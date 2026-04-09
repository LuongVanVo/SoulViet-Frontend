import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { PageHeroSection } from '../../../components/layout/PageHeroSection';
import { SearchInput } from '../../../components/ui/SearchInput';
import { VibeTag } from '../../../components/ui/VibeTag';
import { useVibeTags } from '../../../hooks/useVibeTags'

export const HeroSection = () => {
  const { t } = useTranslation()

  const { data: tags = [], isLoading } = useVibeTags()

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
        {isLoading ? (
          <div className="px-5">Loading tags...</div>
        ) : (
          tags.map((tag) => (
            <VibeTag key={tag.id} tag={tag} variant="hero" />
          ))
        )}
      </div>
    </div>
  )
}