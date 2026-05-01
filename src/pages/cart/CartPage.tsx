import { useMemo, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMyCart } from '@/hooks/useMyCart'
import { useRemoveCartItems, useUpdateCartItemQuantity } from '@/hooks/useCartMutations'
import { usePartnerNames } from '@/hooks/usePartnerNames'

const formatVnd = (v: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(v))}₫`

const parseVariantText = (json: string | null) => {
  if (!json) return ''
  try {
    const obj = JSON.parse(json) as Record<string, string>
    return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ')
  } catch {
    return ''
  }
}

export const CartPage = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useMyCart(true)
  const { mutate: updateQty, isPending: updating } = useUpdateCartItemQuantity()
  const { mutate: removeItems, isPending: removing } = useRemoveCartItems()

  const items = data?.items ?? []
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const partnerIds = useMemo(
    () => items.map((it) => it.partnerId),
    [items]
  )
  const { partnerNameMap } = usePartnerNames(partnerIds)

  const allSelected = items.length > 0 && selectedIds.length === items.length

  const selectedTotal = useMemo(() => {
    const set = new Set(selectedIds)
    return items.reduce((sum, it) => (set.has(it.id) ? sum + it.subTotal : sum), 0)
  }, [items, selectedIds])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const it of items) {
      const key = it.partnerId || 'unknown'
      const arr = map.get(key) ?? []
      arr.push(it)
      map.set(key, arr)
    }
    return Array.from(map.entries())
  }, [items])

  const handleDecrease = (itemId: string, quantity: number) => {
    if (quantity <= 1) {
      removeItems({ cartItemIds: [itemId] })
      setSelectedIds((prev) => prev.filter((id) => id !== itemId))
      return
    }

    updateQty({
      itemId,
      payload: { cartItemId: itemId, newQuantity: quantity - 1 },
    })
  }

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-8">{t('cart.loading')}</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => setSelectedIds(e.target.checked ? items.map((x) => x.id) : [])}
          />
          {t('cart.selectAll', { count: items.length })}
        </label>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-sm">
            {t('cart.total', { count: selectedIds.length })}{' '}
            <span className="font-extrabold text-[#c2552f]">{formatVnd(selectedTotal)}</span>
          </div>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            className="h-10 rounded-full bg-[#10b981] px-5 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#0f9f70] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:px-7 sm:text-sm"
          >
            {t('cart.checkout')}
          </button>
        </div>
      </div>

      <div className="hidden rounded-2xl bg-[#f8faf9] px-6 py-4 text-sm font-semibold text-gray-600 lg:block">
        <div className="grid grid-cols-[1.7fr_0.6fr_0.6fr_0.6fr_0.4fr] gap-2">
          <span>{t('cart.table.product')}</span>
          <span>{t('cart.table.unitPrice')}</span>
          <span>{t('cart.table.quantity')}</span>
          <span>{t('cart.table.total')}</span>
          <span>{t('cart.table.actions')}</span>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {grouped.map(([partnerId, partnerItems]) => (
          <div key={partnerId} className="rounded-3xl bg-[#f8faf9] p-3 sm:p-4 lg:p-5">
            <div className="mb-4 text-sm font-bold text-gray-700">
              {t('cart.partnerLabel', { name: partnerNameMap[partnerId] ?? t('cart.partnerFallback', { id: partnerId.slice(0, 8) }) })}
            </div>

            <div className="space-y-3">
              {partnerItems.map((it) => {
                const checked = selectedIds.includes(it.id)
                const unitPrice = it.promotionalPrice ?? it.price
                const variantText = parseVariantText(it.variantAttributesJson)

                return (
                  <div key={it.id} className="rounded-2xl bg-white p-3 sm:p-4">
                    {/* Mobile + Tablet */}
                    <div className="lg:hidden">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds((prev) => [...prev, it.id])
                            else setSelectedIds((prev) => prev.filter((x) => x !== it.id))
                          }}
                          className="mt-5 shrink-0"
                        />

                        <Link to={`/marketplace/${it.marketplaceProductId}`} className="shrink-0">
                          <img
                            src={it.mainImage || ''}
                            alt={it.productName}
                            className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/marketplace/${it.marketplaceProductId}`}
                            className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#006c49] sm:text-base"
                          >
                            {it.productName}
                          </Link>
                          {variantText ? <div className="mt-1 text-xs text-gray-500 sm:text-sm">{variantText}</div> : null}

                          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm">
                            <div>
                              {it.promotionalPrice ? (
                                <div className="flex flex-col">
                                  <span className="text-gray-400 line-through">{formatVnd(it.price)}</span>
                                  <span>{formatVnd(unitPrice)}</span>
                                </div>
                              ) : (
                                <div>{formatVnd(unitPrice)}</div>
                              )}
                            </div>

                            <div>
                              <div className="inline-flex items-center rounded-full bg-white shadow-[inset_0_0_0_1px_#e5e7eb] px-2 py-1">
                                <button
                                  type="button"
                                  disabled={updating || removing}
                                  onClick={() => handleDecrease(it.id, it.quantity)}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="mx-3 min-w-4 text-center">{it.quantity}</span>
                                <button
                                  type="button"
                                  disabled={updating}
                                  onClick={() =>
                                    updateQty({
                                      itemId: it.id,
                                      payload: { cartItemId: it.id, newQuantity: it.quantity + 1 },
                                    })
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <div className="font-extrabold text-[#d86848]">{formatVnd(it.subTotal)}</div>
                            </div>

                            <div className="col-span-2 flex items-end justify-end pr-1">
                              <button
                                type="button"
                                disabled={removing}
                                onClick={() => removeItems({ cartItemIds: [it.id] })}
                                className="text-gray-300 hover:text-[#d86848]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden items-center gap-2 lg:grid lg:grid-cols-[1.7fr_0.6fr_0.6fr_0.6fr_0.4fr]">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds((prev) => [...prev, it.id])
                            else setSelectedIds((prev) => prev.filter((x) => x !== it.id))
                          }}
                        />
                        <Link to={`/marketplace/${it.marketplaceProductId}`}>
                          <img
                            src={it.mainImage || ''}
                            alt={it.productName}
                            className="h-18 w-18 rounded-lg object-cover"
                          />
                        </Link>
                        <div>
                          <Link
                            to={`/marketplace/${it.marketplaceProductId}`}
                            className="font-semibold transition-colors hover:text-[#006c49]"
                          >
                            {it.productName}
                          </Link>
                          {variantText ? <div className="text-sm text-gray-500">{variantText}</div> : null}
                        </div>
                      </div>

                      <div className="text-sm">
                        {it.promotionalPrice ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through">{formatVnd(it.price)}</span>
                            <span>{formatVnd(unitPrice)}</span>
                          </div>
                        ) : (
                          formatVnd(unitPrice)
                        )}
                      </div>

                      <div>
                        <div className="inline-flex items-center rounded-full bg-white shadow-[inset_0_0_0_1px_#e5e7eb] px-2 py-1">
                          <button
                            type="button"
                            disabled={updating || removing}
                            onClick={() => handleDecrease(it.id, it.quantity)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-3 min-w-4 text-center">{it.quantity}</span>
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() =>
                              updateQty({
                                itemId: it.id,
                                payload: { cartItemId: it.id, newQuantity: it.quantity + 1 },
                              })
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="font-extrabold text-[#d86848]">{formatVnd(it.subTotal)}</div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          disabled={removing}
                          onClick={() => removeItems({ cartItemIds: [it.id] })}
                          className="text-gray-300 hover:text-[#d86848]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}