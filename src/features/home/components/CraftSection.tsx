import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { apiService } from '../../../services/mockData';
import type { CraftSectionData } from '../../../types';
import { useTranslation } from 'react-i18next';

export const CraftSection = () => {
    const { t } = useTranslation();
    const [craftSection, setCraftSection] = useState<CraftSectionData | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        apiService.getCraftSection().then(setCraftSection);
    }, []);

    const scrollCrafts = (direction: 'left' | 'right') => {
        const slider = sliderRef.current;
        if (!slider) return;

        const firstCard = slider.querySelector<HTMLElement>('[data-craft-card]');
        const step = firstCard ? firstCard.offsetWidth + 12 : 260;
        slider.scrollBy({ left: direction === 'right' ? step : -step, behavior: 'smooth' });
    };

    if (!craftSection) return null;

    return (
        <section className="mt-10">
            <div className="mb-4 flex flex-row items-center justify-between gap-3 px-5 sm:px-8">
                <div className="flex flex-row items-center gap-2">
                    <Flame className="h-4 w-4 text-secondary-alt" />
                    <h2 className="text-xl font-semibold text-text-dark">
                        {t('home.craftSectionTitle')}
                    </h2>
                </div>
                <div className="flex flex-row items-center gap-2">
                    <button
                        type="button"
                        onClick={() => scrollCrafts('left')}
                        className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                        aria-label="Previous crafts"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollCrafts('right')}
                        className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-primary transition hover:border-primary hover:bg-primary hover:text-white"
                        aria-label="Next crafts"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button className="flex items-center space-x-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                        <span className="hidden sm:inline">{t('home.viewAll')}</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={sliderRef}
                className="flex flex-row gap-3 overflow-x-auto pb-2 px-5 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {craftSection.items.map((card) => (
                    <div key={card.id} data-craft-card className="w-[180px] sm:w-[200px] lg:w-[220px] shrink-0">
                        <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                            <div className="aspect-[4/3] w-full overflow-hidden">
                                <img
                                    src={card.imageUrl}
                                    alt={card.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>

                            <div className="px-3 py-2 text-center">
                                <h3 className="text-sm font-semibold text-text-dark line-clamp-1">
                                    {card.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-1">
                                    {card.location}
                                </p>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </section>
    );
};
