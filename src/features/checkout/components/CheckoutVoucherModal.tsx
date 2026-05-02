import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { touristVoucherApi } from '@/services/tourist/touristVoucher.api'
import { DiscountType } from '@/types/voucher.enums'

type VoucherOption = { label: string; code: string; discountType?: number }

type Props = {
  open: boolean
  onClose: () => void
  title: string
  partnerId?: string
  currentOrderAmount: number
  initialCode: string | null
  onConfirm: (code: string | null) => void
  /** false khi giỏ chỉ tour / không có phí ship — chặn voucher miễn phí vận chuyển */
  allowFreeShippingVoucher?: boolean
}

function extractVoucherOptions(data: unknown): VoucherOption[] {
  if (!data) return []
  const raw = Array.isArray(data) ? data : (data as { items?: unknown })?.items ?? []
  if (!Array.isArray(raw)) return []
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>
      const code = String(r.code ?? r.Code ?? '')
      if (!code) return null
      const label = String(
        r.name ??
          r.Name ??
          r.description ??
          r.Description ??
          r.title ??
          r.Title ??
          code,
      )
      const dtRaw = r.discountType ?? r.DiscountType
      const n = Number(dtRaw)
      const discountType = Number.isFinite(n) ? n : undefined
      return { label, code, discountType } satisfies VoucherOption
    })
    .filter(Boolean) as VoucherOption[]
}

function isFreeShipping(dt: number | undefined): boolean {
  return dt === DiscountType.FreeShipping
}

export function CheckoutVoucherModal({
  open,
  onClose,
  title,
  partnerId,
  currentOrderAmount,
  initialCode,
  onConfirm,
  allowFreeShippingVoucher = true,
}: Props) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const listQuery = useQuery({
    queryKey: ['tourist-vouchers-available', partnerId ?? 'platform', currentOrderAmount],
    queryFn: () =>
      touristVoucherApi.getAvailable({
        partnerId,
        currentOrderAmount,
      }),
    enabled: open,
  })

  const options = useMemo(() => extractVoucherOptions(listQuery.data), [listQuery.data])

  useEffect(() => {
    if (!open) return
    setSelected(initialCode)
    setInput(initialCode ?? '')
    setApplyError(null)
    setApplying(false)
  }, [open, initialCode])

  if (!open) return null

  const rejectFreeShipping = (msg: string) => {
    setApplyError(msg)
    toast.error(msg)
  }

  const selectFromList = (o: VoucherOption) => {
    setSelected(o.code)
    setInput(o.code)
    setApplyError(null)
  }

  /** Chỉ nút Áp dụng cạnh ô nhập: kiểm tra API rồi ghi nhận vào đơn và đóng modal. */
  const applyFromInput = async () => {
    const code = input.trim()
    if (!code) {
      const msg = t('checkout.voucher.enterCode')
      setApplyError(msg)
      toast.error(msg)
      return
    }

    const fromList = options.find((o) => o.code === code)
    const hintedType = fromList?.discountType

    if (isFreeShipping(hintedType) && !allowFreeShippingVoucher) {
      rejectFreeShipping(t('checkout.voucher.tourNoFreeShipping'))
      return
    }

    setApplyError(null)
    setApplying(true)
    try {
      const res = await touristVoucherApi.checkValid(
        { code, partnerId, currentOrderAmount },
        t('checkout.voucher.checkFailed'),
      )

      if (!res.ok) {
        const msg = res.message ?? t('checkout.voucher.invalid')
        setApplyError(msg)
        toast.error(msg)
        return
      }

      const effectiveType = res.discountType ?? hintedType
      if (isFreeShipping(effectiveType) && !allowFreeShippingVoucher) {
        rejectFreeShipping(t('checkout.voucher.tourNoFreeShipping'))
        return
      }

      setSelected(code)
      setInput(code)
      toast.success(t('checkout.voucher.appliedSuccess'))
      onConfirm(code)
      onClose()
    } finally {
      setApplying(false)
    }
  }

  /** OK như cũ: xác nhận mã đang chọn / đang gõ, không gọi check-valid. */
  const handleOk = () => {
    const code = input.trim() || selected
    if (!code) {
      const msg = t('checkout.voucher.enterCode')
      setApplyError(msg)
      toast.error(msg)
      return
    }
    const fromList = options.find((o) => o.code === code)
    if (isFreeShipping(fromList?.discountType) && !allowFreeShippingVoucher) {
      rejectFreeShipping(t('checkout.voucher.tourNoFreeShipping'))
      return
    }
    onConfirm(code)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#fdfaf5] shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#004d40]">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-black/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              placeholder={t('checkout.voucher.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={applying}
            />
            <button
              type="button"
              disabled={applying}
              onClick={() => void applyFromInput()}
              className="shrink-0 rounded-xl bg-gray-200 px-4 text-xs font-bold uppercase disabled:opacity-50"
            >
              {t('checkout.voucher.apply')}
            </button>
          </div>
          {applyError ? <p className="text-sm text-red-600">{applyError}</p> : null}

          <div className="text-xs font-bold uppercase text-gray-500">
            {t('checkout.voucher.suggested')}
          </div>
          {listQuery.isLoading ? (
            <p className="text-sm text-gray-500">{t('checkout.voucher.loadingList')}</p>
          ) : options.length === 0 ? (
            <p className="text-sm text-gray-500">{t('checkout.voucher.emptyList')}</p>
          ) : (
            <div className="space-y-2">
              {options.map((o) => (
                <button
                  key={o.code}
                  type="button"
                  disabled={applying}
                  onClick={() => selectFromList(o)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition disabled:opacity-50 ${
                    selected === o.code ? 'border-[#004d40] bg-white' : 'border-gray-200 bg-white/80'
                  }`}
                >
                  <span className="font-medium text-gray-900">{o.label}</span>
                  <span className="text-xs text-gray-500">{o.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-black/5 px-4 py-4">
          <span className="text-xs text-gray-600">
            {t('checkout.voucher.selectedCount', { count: selected ? 1 : 0 })}
          </span>
          <button
            type="button"
            onClick={handleOk}
            className="rounded-xl bg-[#004d40] px-6 py-2 text-sm font-bold uppercase text-white"
          >
            {t('checkout.voucher.ok')}
          </button>
        </div>
      </div>
    </div>
  )
}
