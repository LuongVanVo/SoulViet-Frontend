import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TouristAttractionsCard } from '@/components';
import { useTouristAttractions } from '@/hooks/useTouristAttractions';
import { useVibeTags } from '@/hooks/useVibeTags';

export const TouristAttractionsSection = () => {
  const { t } = useTranslation();
  const { data: touristAttractionsSection } = useTouristAttractions();
  const { data: tags = [] } = useVibeTags();
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const getTagInfo = (tagId: string) => {
    return tags.find((t) => String(t.id) === tagId);
  };

  const scrollStories = (direction: 'left' | 'right') => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstCard = slider.querySelector<HTMLElement>('[data-story-card]');
    const step = firstCard ? firstCard.offsetWidth + 24 : 360;
    slider.scrollBy({ left: direction === 'right' ? step : -step, behavior: 'smooth' });
  };

  return (
    <div className="mt-5">
      <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-dark">{t('home.touristAttractionsSectionTitle')}</h2>
        </div>
        <div className="flex flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => scrollStories('left')}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary hover:bg-primary hover:text-white"
            aria-label="Previous stories"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollStories('right')}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary hover:bg-primary hover:text-white"
            aria-label="Next stories"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button className="flex items-center space-x-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
            <span>{t('home.viewAll')}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex flex-col sm:flex-row gap-6 sm:overflow-x-auto pb-2 px-6 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {touristAttractionsSection?.items.map(story => (
          <div key={story.id} data-story-card className="w-full sm:w-[260px] lg:w-[300px] shrink-0">
            <TouristAttractionsCard
              item={story}
              tagInfo={getTagInfo(story.tagId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};