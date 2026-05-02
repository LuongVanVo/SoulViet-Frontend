import { useEffect, useMemo, useState } from 'react'
import { BookMarked, MapPin, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  VIETNAM_PROVINCE_TREE,
  buildShippingAddressLine,
} from '@/utils/vietnamLocalUnits'

export type SavedCheckoutAddress = {
  id: string
  receiverName: string
  receiverPhone: string
  receiverEmail: string
  shippingAddress: string
  provinceCode?: string
  wardCode?: string
  streetLine?: string
  isDefault: boolean
}

export type CheckoutAddressConfirmPayload = Omit<SavedCheckoutAddress, 'id' | 'isDefault'> & {
  id?: string
}

type Props = {
  open: boolean
  onClose: () => void
  saved: SavedCheckoutAddress[]
  onSaveSaved: (list: SavedCheckoutAddress[]) => void
  onConfirm: (addr: CheckoutAddressConfirmPayload) => void
  initial?: CheckoutAddressConfirmPayload | null
}

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `addr-${Date.now()}`

const emptyDraft = () => ({
  receiverName: '',
  receiverPhone: '',
  receiverEmail: '',
  provinceCode: '',
  wardCode: '',
  streetLine: '',
})

export function CheckoutAddressModal({
  open,
  onClose,
  saved,
  onSaveSaved,
  onConfirm,
  initial,
}: Props) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState(emptyDraft)

  const province = useMemo(
    () => VIETNAM_PROVINCE_TREE.find((p: any) => p.code === draft.provinceCode),
    [draft.provinceCode]
  )

  const ward = useMemo(
    () => province?.wards.find((w: any) => w.code === draft.wardCode),
    [province, draft.wardCode]
  )

  const shippingLine = useMemo(
    () => buildShippingAddressLine(draft.streetLine, ward?.fullName, province?.fullName),
    [draft.streetLine, ward?.fullName, province?.fullName]
  )

  const formComplete =
    Boolean(draft.receiverName.trim()) &&
    Boolean(draft.receiverPhone.trim()) &&
    Boolean(draft.provinceCode) &&
    Boolean(draft.wardCode) &&
    Boolean(draft.streetLine.trim())

  useEffect(() => {
    if (!open) return
    if (initial) {
      setDraft({
        receiverName: initial.receiverName,
        receiverPhone: initial.receiverPhone,
        receiverEmail: initial.receiverEmail,
        provinceCode: initial.provinceCode ?? '',
        wardCode: initial.wardCode ?? '',
        streetLine: initial.streetLine ?? '',
      })
      setSelectedId(null)
      return
    }
    const def = saved.find((s) => s.isDefault) ?? saved[0]
    if (def) {
      setSelectedId(def.id)
      setDraft({
        receiverName: def.receiverName,
        receiverPhone: def.receiverPhone,
        receiverEmail: def.receiverEmail,
        provinceCode: def.provinceCode ?? '',
        wardCode: def.wardCode ?? '',
        streetLine: def.streetLine ?? '',
      })
    } else {
      setSelectedId(null)
      setDraft(emptyDraft())
    }
  }, [open, initial, saved])

  if (!open) return null

  const applySaved = (s: SavedCheckoutAddress) => {
    setSelectedId(s.id)
    setDraft({
      receiverName: s.receiverName,
      receiverPhone: s.receiverPhone,
      receiverEmail: s.receiverEmail,
      provinceCode: s.provinceCode ?? '',
      wardCode: s.wardCode ?? '',
      streetLine: s.streetLine ?? '',
    })
  }

  const setDefault = (id: string) => {
    onSaveSaved(
      saved.map((s) => ({
        ...s,
        isDefault: s.id === id,
      }))
    )
  }

  const handleAddNew = () => {
    setSelectedId(null)
    setDraft(emptyDraft())
  }

  const handleConfirm = () => {
    if (!formComplete) return
    onConfirm({
      receiverName: draft.receiverName.trim(),
      receiverPhone: draft.receiverPhone.trim(),
      receiverEmail: draft.receiverEmail.trim(),
      shippingAddress: shippingLine,
      provinceCode: draft.provinceCode,
      wardCode: draft.wardCode,
      streetLine: draft.streetLine.trim(),
      id: selectedId ?? undefined,
    })
    onClose()
  }

  const handleSaveToBook = () => {
    if (!formComplete) return
    const entry: SavedCheckoutAddress = {
      id: selectedId ?? genId(),
      receiverName: draft.receiverName.trim(),
      receiverPhone: draft.receiverPhone.trim(),
      receiverEmail: draft.receiverEmail.trim(),
      shippingAddress: shippingLine,
      provinceCode: draft.provinceCode,
      wardCode: draft.wardCode,
      streetLine: draft.streetLine.trim(),
      isDefault: saved.length === 0,
    }
    const others = saved.filter((s) => s.id !== entry.id)
    onSaveSaved([
      entry,
      ...others.map((s) => (entry.isDefault ? { ...s, isDefault: false } : s)),
    ])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#fdfaf5] shadow-2xl ring-1 ring-black/5">
        <div className="flex shrink-0 items-center justify-between border-b border-[#004d40]/10 bg-[#fdfaf5] px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#004d40]" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#004d40]">
              {t('checkout.address.modalTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition hover:bg-black/5"
            aria-label={t('checkout.address.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-4">
          {saved.length > 0 ? (
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                <BookMarked className="h-3.5 w-3.5" />
                {t('checkout.address.savedOnDevice')}
              </div>
              <div className="space-y-2">
                {saved.map((s) => {
                  const active = selectedId === s.id
                  return (
                    <div
                      key={s.id}
                      className={`rounded-xl border transition ${
                        active
                          ? 'border-[#004d40] bg-white shadow-[0_2px_8px_rgba(0,77,64,0.08)]'
                          : 'border-gray-200/80 bg-white/70 hover:border-gray-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => applySaved(s)}
                        className="w-full px-3 py-3 text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">{s.receiverName}</div>
                            <div className="text-sm text-gray-600">{s.receiverPhone}</div>
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600">
                              {s.shippingAddress}
                            </p>
                          </div>
                          {s.isDefault ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                              <Star className="h-3 w-3 fill-amber-600 text-amber-600" />
                              {t('checkout.address.defaultBadge')}
                            </span>
                          ) : null}
                        </div>
                      </button>
                      {!s.isDefault ? (
                        <div className="border-t border-gray-100 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setDefault(s.id)}
                            className="text-xs font-semibold text-[#004d40] hover:underline"
                          >
                            {t('checkout.address.setDefault')}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="mb-4 rounded-xl border border-dashed border-gray-200 bg-white/50 px-3 py-3 text-center text-xs text-gray-500">
              {t('checkout.address.savedEmpty')}
            </p>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#004d40]">
              {t('checkout.address.formSection')}
            </p>
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t('checkout.address.name')}
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2"
                  placeholder={t('checkout.address.name')}
                  value={draft.receiverName}
                  onChange={(e) => setDraft((d) => ({ ...d, receiverName: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t('checkout.address.phone')}
                </label>
                <input
                  inputMode="tel"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2"
                  placeholder={t('checkout.address.phone')}
                  value={draft.receiverPhone}
                  onChange={(e) => setDraft((d) => ({ ...d, receiverPhone: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t('checkout.address.emailOptional')}
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2"
                  placeholder={t('checkout.address.emailOptional')}
                  value={draft.receiverEmail}
                  onChange={(e) => setDraft((d) => ({ ...d, receiverEmail: e.target.value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {t('checkout.address.province')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2"
                    value={draft.provinceCode}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        provinceCode: e.target.value,
                        wardCode: '',
                      }))
                    }
                  >
                    <option value="">{t('checkout.address.selectProvince')}</option>
                    {VIETNAM_PROVINCE_TREE.map((p: any) => (
                      <option key={p.code} value={p.code}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {t('checkout.address.ward')}
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                    disabled={!province}
                    value={draft.wardCode}
                    onChange={(e) => setDraft((d) => ({ ...d, wardCode: e.target.value }))}
                  >
                    <option value="">
                      {province ? t('checkout.address.selectWard') : t('checkout.address.selectProvinceFirst')}
                    </option>
                    {(province?.wards ?? []).map((w: any) => (
                      <option key={w.code} value={w.code}>
                        {w.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {t('checkout.address.street')}
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-[#004d40]/20 focus:ring-2"
                  placeholder={t('checkout.address.streetPlaceholder')}
                  value={draft.streetLine}
                  onChange={(e) => setDraft((d) => ({ ...d, streetLine: e.target.value }))}
                />
              </div>

              <div className="rounded-lg bg-[#f5efe6] px-3 py-2 text-xs text-gray-700">
                <span className="font-semibold text-[#8d4925]">{t('checkout.address.previewLabel')} </span>
                <span className={shippingLine ? 'text-gray-800' : 'text-gray-400'}>
                  {shippingLine || t('checkout.address.previewEmpty')}
                </span>
              </div>

              <p className="text-[10px] leading-relaxed text-gray-400">{t('checkout.address.dataAttribution')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-black/5 bg-[#fdfaf5] px-4 pb-6 pt-4">
          <button
            type="button"
            onClick={handleAddNew}
            className="w-full rounded-xl border-2 border-[#004d40] py-2.5 text-sm font-bold text-[#004d40] transition hover:bg-[#004d40]/5"
          >
            {t('checkout.address.addNew')}
          </button>
          <button
            type="button"
            disabled={!formComplete}
            onClick={handleSaveToBook}
            title={!formComplete ? t('checkout.address.saveDisabledHint') : undefined}
            className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t('checkout.address.saveToBook')}
          </button>
          {!formComplete ? (
            <p className="text-center text-[11px] text-gray-500">{t('checkout.address.saveDisabledHint')}</p>
          ) : null}
          <button
            type="button"
            disabled={!formComplete}
            onClick={handleConfirm}
            className="w-full rounded-xl bg-[#8d4925] py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#7a3f20] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t('checkout.address.confirm')}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}