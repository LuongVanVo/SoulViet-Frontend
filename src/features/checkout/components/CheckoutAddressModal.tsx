import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookMarked, Loader2, MapPin, Star, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { userAddressApi } from '@/services/user'
import type { UpsertUserAddressPayload, UserAddressDto } from '@/types'
import { getAxiosErrorMessage } from '@/utils/axiosErrorMessage'
import {
  VIETNAM_PROVINCE_TREE,
  buildShippingAddressLine,
} from '@/utils/vietnamLocalUnits'

export type CheckoutAddressConfirmPayload = {
  id?: string
  receiverName: string
  receiverPhone: string
  receiverEmail: string
  shippingAddress: string
  provinceCode?: string
  wardCode?: string
  streetLine?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (addr: CheckoutAddressConfirmPayload) => void
  initial?: CheckoutAddressConfirmPayload | null
}

type Draft = {
  receiverName: string
  receiverPhone: string
  receiverEmail: string
  provinceCode: string
  wardCode: string
  streetLine: string
}

const emptyDraft = (): Draft => ({
  receiverName: '',
  receiverPhone: '',
  receiverEmail: '',
  provinceCode: '',
  wardCode: '',
  streetLine: '',
})

const normalize = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

function findProvinceByName(name?: string) {
  if (!name) return undefined
  const n = normalize(name)
  return VIETNAM_PROVINCE_TREE.find((p: any) => {
    const full = normalize(String(p.fullName ?? ''))
    const short = normalize(String(p.name ?? ''))
    return full === n || short === n || full.includes(n) || n.includes(full)
  })
}

function findWardByName(province: any, name?: string) {
  if (!province || !name) return undefined
  const n = normalize(name)
  return (province.wards ?? []).find((w: any) => {
    const full = normalize(String(w.fullName ?? ''))
    const short = normalize(String(w.name ?? ''))
    return full === n || short === n || full.includes(n) || n.includes(full)
  })
}

function draftFromAddress(addr: UserAddressDto): Draft {
  const p = findProvinceByName(addr.province)
  const w = findWardByName(p, addr.ward)
  return {
    receiverName: addr.receiverName,
    receiverPhone: addr.receiverPhone,
    receiverEmail: '',
    provinceCode: p?.code ?? '',
    wardCode: w?.code ?? '',
    streetLine: addr.detailedAddress ?? '',
  }
}

export function CheckoutAddressModal({
  open,
  onClose,
  onConfirm,
  initial,
}: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const addressesQuery = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => userAddressApi.getMine(),
    enabled: open,
  })

  const saved = addressesQuery.data ?? []

  const province = useMemo(
    () => VIETNAM_PROVINCE_TREE.find((p: any) => p.code === draft.provinceCode),
    [draft.provinceCode],
  )

  const ward = useMemo(
    () => province?.wards.find((w: any) => w.code === draft.wardCode),
    [province, draft.wardCode],
  )

  const shippingLine = useMemo(
    () =>
      buildShippingAddressLine(
        draft.streetLine,
        ward?.fullName,
        province?.fullName,
      ),
    [draft.streetLine, ward?.fullName, province?.fullName],
  )

  const formComplete =
    Boolean(draft.receiverName.trim()) &&
    Boolean(draft.receiverPhone.trim()) &&
    Boolean(draft.provinceCode) &&
    Boolean(draft.wardCode) &&
    Boolean(draft.streetLine.trim())

  useEffect(() => {
    if (!open) return
    if (initial && initial.shippingAddress) {
      setDraft(emptyDraft())
      setSelectedId(initial.id ?? null)
      setEditingId(null)
      return
    }
    const def = saved.find((s) => s.isDefault) ?? saved[0]
    if (def) {
      setSelectedId(def.id)
      setEditingId(null)
      setDraft(emptyDraft())
    } else {
      setSelectedId(null)
      setEditingId(null)
      setDraft(emptyDraft())
    }
  }, [open, initial, saved])

  const createMutation = useMutation({
    mutationFn: (payload: UpsertUserAddressPayload) => userAddressApi.create(payload),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: UpsertUserAddressPayload & { id: string }) =>
      userAddressApi.update(payload),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userAddressApi.delete(id),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => userAddressApi.setDefault(id),
  })

  if (!open) return null

  const refetchAddresses = async () => {
    await qc.invalidateQueries({ queryKey: ['user-addresses'] })
    await addressesQuery.refetch()
  }

  const setSavedCache = (
    updater: (prev: UserAddressDto[]) => UserAddressDto[],
  ) => {
    qc.setQueryData<UserAddressDto[]>(['user-addresses'], (prev) =>
      updater(prev ?? []),
    )
  }

  const applySaved = (s: UserAddressDto) => {
    setSelectedId(s.id)
  }

  const handleEdit = (s: UserAddressDto) => {
    setEditingId(s.id)
    setSelectedId(s.id)
    setDraft(draftFromAddress(s))
  }

  const handleSetDefault = async (id: string) => {
    try {
      const ok = await setDefaultMutation.mutateAsync(id)
      if (!ok) {
        toast.error(t('checkout.address.defaultFailed'))
        return
      }
      setSavedCache((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      )
      toast.success(t('checkout.address.defaultSuccess'))
      void refetchAddresses()
    } catch (e) {
      toast.error(getAxiosErrorMessage(e, t('checkout.address.defaultFailed')))
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return
    const id = deleteTargetId
    try {
      const ok = await deleteMutation.mutateAsync(id)
      if (!ok) {
        toast.error(t('checkout.address.deleteFailed'))
        return
      }
      setSavedCache((prev) => prev.filter((a) => a.id !== id))
      toast.success(t('checkout.address.deleteSuccess'))
      setDeleteTargetId(null)
      if (selectedId === id) {
        setSelectedId(null)
      }
      if (editingId === id) {
        setEditingId(null)
        setDraft(emptyDraft())
      }
      void refetchAddresses()
    } catch (e) {
      toast.error(getAxiosErrorMessage(e, t('checkout.address.deleteFailed')))
    }
  }

  const handleUseDraftAddress = () => {
    if (!formComplete) return
    if (!province || !ward) {
      toast.error(t('checkout.address.invalidProvinceWard'))
      return
    }
    const receiverName = draft.receiverName.trim()
    const receiverPhone = draft.receiverPhone.trim()
    const receiverEmail = draft.receiverEmail.trim()
    const streetLine = draft.streetLine.trim()
    onConfirm({
      id: undefined,
      receiverName,
      receiverPhone,
      receiverEmail,
      shippingAddress: buildShippingAddressLine(
        streetLine,
        ward.fullName,
        province.fullName,
      ),
      provinceCode: draft.provinceCode,
      wardCode: draft.wardCode,
      streetLine,
    })
    onClose()
  }

  const handleSaveToBook = async () => {
    if (!formComplete) return
    if (!province || !ward) {
      toast.error(t('checkout.address.invalidProvinceWard'))
      return
    }

    const payload: UpsertUserAddressPayload = {
      receiverName: draft.receiverName.trim(),
      receiverPhone: draft.receiverPhone.trim(),
      province: province.fullName,
      district: '',
      ward: ward.fullName,
      detailedAddress: draft.streetLine.trim(),
      isDefault: saved.length === 0 ? true : undefined,
    }

    try {
      if (editingId) {
        const res = await updateMutation.mutateAsync({ ...payload, id: editingId })
        if (!res.success) {
          toast.error(res.message || t('checkout.address.saveFailed'))
          return
        }
        const p = VIETNAM_PROVINCE_TREE.find((x: any) => x.code === draft.provinceCode)
        const w = p?.wards.find((x: any) => x.code === draft.wardCode)
        const fullAddress = buildShippingAddressLine(
          draft.streetLine.trim(),
          w?.fullName,
          p?.fullName,
        )
        setSavedCache((prev) =>
          prev.map((a) =>
            a.id === editingId
              ? {
                  ...a,
                  receiverName: draft.receiverName.trim(),
                  receiverPhone: draft.receiverPhone.trim(),
                  province: p?.fullName ?? a.province,
                  district: '',
                  ward: w?.fullName ?? a.ward,
                  detailedAddress: draft.streetLine.trim(),
                  fullAddress,
                }
              : a,
          ),
        )
        toast.success(t('checkout.address.updateSuccess'))
      } else {
        const res = await createMutation.mutateAsync(payload)
        if (!res.success) {
          toast.error(res.message || t('checkout.address.saveFailed'))
          return
        }
        setSelectedId(res.id)
        const p = VIETNAM_PROVINCE_TREE.find((x: any) => x.code === draft.provinceCode)
        const w = p?.wards.find((x: any) => x.code === draft.wardCode)
        const fullAddress = buildShippingAddressLine(
          draft.streetLine.trim(),
          w?.fullName,
          p?.fullName,
        )
        setSavedCache((prev) => [
          {
            id: res.id,
            receiverName: draft.receiverName.trim(),
            receiverPhone: draft.receiverPhone.trim(),
            province: p?.fullName ?? '',
            district: '',
            ward: w?.fullName ?? '',
            detailedAddress: draft.streetLine.trim(),
            fullAddress,
            isDefault: prev.length === 0,
          },
          ...prev.map((a) => ({
            ...a,
            isDefault: prev.length === 0 ? false : a.isDefault,
          })),
        ])
        toast.success(t('checkout.address.createSuccess'))
      }
      setEditingId(null)
      setDraft(emptyDraft())
      void refetchAddresses()
    } catch (e) {
      toast.error(getAxiosErrorMessage(e, t('checkout.address.saveFailed')))
    }
  }

  const handleConfirm = () => {
    if (selectedId) {
      const chosen = saved.find((s) => s.id === selectedId)
      if (!chosen) return
      const mapped = draftFromAddress(chosen)
      onConfirm({
        id: chosen.id,
        receiverName: chosen.receiverName,
        receiverPhone: chosen.receiverPhone,
        receiverEmail: '',
        shippingAddress: chosen.fullAddress || chosen.detailedAddress,
        provinceCode: mapped.provinceCode,
        wardCode: mapped.wardCode,
        streetLine: chosen.detailedAddress,
      })
      onClose()
      return
    }
  }

  const busy =
    addressesQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    setDefaultMutation.isPending

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
            {addressesQuery.isLoading ? (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('checkout.address.loading')}
              </div>
            ) : saved.length > 0 ? (
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
                                {s.fullAddress || s.detailedAddress}
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
                        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleEdit(s)}
                              className="text-xs font-semibold text-[#004d40] hover:underline"
                            >
                              {t('checkout.address.edit')}
                            </button>
                            {!s.isDefault ? (
                              <button
                                type="button"
                                onClick={() => void handleSetDefault(s.id)}
                                className="text-xs font-semibold text-[#004d40] hover:underline"
                              >
                                {t('checkout.address.setDefault')}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">{t('checkout.address.defaultBadge')}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(s.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {t('checkout.address.delete')}
                          </button>
                        </div>
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
                {/* giữ nguyên inputs như file hiện tại */}
                {/* name */}
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

                {/* phone */}
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

                {/* email optional */}
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
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-black/5 bg-[#fdfaf5] px-4 pb-6 pt-4">
            <button
              type="button"
              disabled={!formComplete || busy}
              onClick={handleUseDraftAddress}
              className="w-full rounded-xl border-2 border-[#004d40] py-2.5 text-sm font-bold text-[#004d40] transition hover:bg-[#004d40]/5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t('checkout.address.addNew')}
            </button>

            <button
              type="button"
              disabled={!formComplete || busy}
              onClick={() => void handleSaveToBook()}
              className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy
                ? t('checkout.address.saving')
                : editingId
                  ? t('checkout.address.update')
                  : t('checkout.address.saveToBook')}
            </button>

            <button
              type="button"
              disabled={!selectedId}
              onClick={handleConfirm}
              className="w-full rounded-xl bg-[#8d4925] py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-md transition hover:bg-[#7a3f20] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t('checkout.address.confirm')}
            </button>
          </div>
        </div>

        {deleteTargetId ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
              <h3 className="text-base font-bold text-gray-900">
                {t('checkout.address.deleteTitle')}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('checkout.address.deleteConfirm')}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {t('checkout.address.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteConfirmed()}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending
                    ? t('checkout.address.deleting')
                    : t('checkout.address.delete')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}