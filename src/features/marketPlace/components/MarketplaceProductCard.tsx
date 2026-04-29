import { Heart, MapPin, ShoppingBag } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { MarketplaceItem } from '@/types'
import { Card } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const TOUR_BADGE_CLASS = 'bg-[#006c49] text-white shadow-sm'
const PRODUCT_BADGE_CLASS = 'bg-[#9a442d] text-white shadow-sm'

export const MarketplaceProductCard = ({
  item,
  variant = 'default',
}: {
  item: MarketplaceItem
  variant?: 'default' | 'featured'
}) => {
  const { t } = useTranslation()
  const isTour = item.kind === 'tour'
  const badgeClass = isTour ? TOUR_BADGE_CLASS : PRODUCT_BADGE_CLASS
  const badgeText = isTour ? t('marketplace.card.badge.tour') : t('marketplace.card.badge.product')

  return (
    <Link to={`/marketplace/${item.id}`} className="block">
        <Card className={cn('group overflow-hidden border-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl')}>
            <div className="relative">
                <div className={cn('relative overflow-hidden', variant === 'featured' ? 'aspect-16/10' : 'aspect-4/3')}>
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                <div className="absolute left-4 top-4">
                <span
                    className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold tracking-wide',
                    badgeClass
                    )}
                >
                    {badgeText}
                </span>
                </div>

                <div className="absolute right-3 top-3">
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#9a442d] shadow-sm backdrop-blur-md hover:scale-105 transition-transform"
                    aria-label={t('marketplace.card.likeAria')}
                >
                    <Heart className="h-4 w-4" />
                </button>
                </div>

                <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/80 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-extrabold text-white">{item.priceText}</p>
                </div>
                </div>
            </div>

            <div className="space-y-4 p-5">
                <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#1f1b17] line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col">
                        <div className="text-sm font-extrabold text-gray-900">{item.priceText}</div>
                        {item.originalPriceText ? (
                        <div className="text-xs text-gray-400 line-through">{item.originalPriceText}</div>
                        ) : null}
                    </div>
                    
                {isTour ? (
                    <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006c49] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#005236] transition-colors"
                    >
                    <ShoppingBag className="h-4 w-4" />
                    {t('marketplace.card.tourCta')}
                    </button>
                ) : (
                    <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9a442d] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#742814] transition-colors"
                    >
                    <ShoppingBag className="h-4 w-4" />
                    {t('marketplace.card.productCta')}
                    </button>
                )}
                </div>
            </div>
        </Card>
    </Link>
  )
}