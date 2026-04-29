import { useState } from 'react'
import { Heart, MapPin, Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui'
import type { MarketplaceProductDetailVM } from '@/hooks/useMarketplaceProductDetail'
import { useTranslation } from 'react-i18next'

export const MarketplaceTourPurchaseCard = ({
  product,
}: {
  product: MarketplaceProductDetailVM
}) => {
  const { t } = useTranslation()
  const [travelDate, setTravelDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  const maxStock = Math.max(product.stock, 1)

  const increase = () => setQuantity((prev) => Math.min(prev + 1, maxStock))
  const decrease = () => setQuantity((prev) => Math.max(prev - 1, 1))

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">{product.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{product.location}</span>
          </div>
        </div>

        <button type="button" className="rounded-full border border-gray-100 p-2">
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-end gap-2">
          <div className="text-2xl font-extrabold text-gray-900">{product.priceText}</div>
          {product.originalPriceText && (
            <div className="pb-1 text-sm text-gray-400 line-through">{product.originalPriceText}</div>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-500">{t('marketplace.detail.purchase.tour.perTicket')}</div>
      </div>

      <div className="mt-5 rounded-2xl bg-[#006c49]/5 p-3 text-sm text-gray-700">
        <p>{t('marketplace.detail.purchase.tour.availableDaily')}</p>
        <p className="mt-1">{t('marketplace.detail.purchase.tour.ticketQuantityHint')}</p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('marketplace.detail.purchase.tour.travelDateLabel')}
          </div>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-200 px-4 text-sm outline-none"
          />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('marketplace.detail.purchase.tour.ticketsLabel')}
          </div>

          <div className="flex w-fit items-center rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={decrease}
              className="px-4 py-3 text-gray-700 hover:text-gray-900"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="min-w-12 text-center text-sm font-semibold">{quantity}</div>

            <button
              type="button"
              onClick={increase}
              className="px-4 py-3 text-gray-700 hover:text-gray-900"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('marketplace.detail.purchase.tour.noteLabel')}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={t('marketplace.detail.purchase.tour.notePlaceholder')}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#006c49] text-white font-extrabold hover:bg-[#005236]">
          {t('marketplace.detail.purchase.tour.bookNow')}
        </button>

        <button className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#006c49] text-[#006c49] font-extrabold hover:bg-[#006c49]/5">
          {t('marketplace.detail.purchase.tour.addToCart')}
        </button>

        <div className="text-center text-xs text-gray-500">
          {t('marketplace.detail.purchase.securePayment')}
        </div>
      </div>
    </Card>
  )
}