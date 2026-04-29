import { Skeleton } from '@/components/ui'
import { MarketplaceProductCard } from './MarketplaceProductCard'
import type { MarketplaceItem } from '@/types'
import { useTranslation } from 'react-i18next'

export const MarketplaceProductsSection = ({
  items,
  isLoading,
}: {
  items: MarketplaceItem[]
  isLoading: boolean
}) => {
  const { t } = useTranslation()

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <Skeleton className="aspect-4/3 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            ))
          : items.map((item) => (
              <div key={item.id} className={item.featured ? 'lg:col-span-2' : 'lg:col-span-1'}>
                <MarketplaceProductCard item={item} variant={item.featured ? 'featured' : 'default'} />
              </div>
            ))}

        {!isLoading && items.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-4 text-center text-gray-500 py-16">
            {t('marketplace.products.noResults')}
          </div>
        )}
      </div>
    </section>
  )
}