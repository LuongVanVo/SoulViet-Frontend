import { apiClient } from '@/services'
import { getAxiosErrorMessage } from '@/utils/axiosErrorMessage'

export type TouristVoucherListParams = {
  partnerId?: string
  currentOrderAmount?: number
}

export type CheckVoucherParams = {
  code: string
  partnerId?: string
  currentOrderAmount?: number
}

export type CheckVoucherResult = {
  ok: boolean
  message?: string
  discountType?: number
}

function readDiscountType(data: unknown): number | undefined {
  if (data == null || typeof data !== 'object') return undefined
  const r = data as Record<string, unknown>
  const n = Number(r.discountType ?? r.DiscountType)
  return Number.isFinite(n) ? n : undefined
}

export function parseCheckVoucherValid(data: unknown): CheckVoucherResult {
  if (typeof data === 'boolean') return { ok: data }
  if (data != null && typeof data === 'object') {
    const r = data as Record<string, unknown>
    const hasCode = r.code != null || r.Code != null
    const hasId = r.id != null || r.Id != null
    if (hasCode || hasId) {
      return { ok: true, discountType: readDiscountType(data) }
    }
    const ok =
      (r.isValid as boolean | undefined) ??
      (r.IsValid as boolean | undefined) ??
      (r.valid as boolean | undefined) ??
      (r.Valid as boolean | undefined) ??
      false
    const message = (r.message ?? r.Message) as string | undefined
    return { ok: Boolean(ok), message, discountType: readDiscountType(data) }
  }
  return { ok: false }
}

export const touristVoucherApi = {
  async getAvailable(params: TouristVoucherListParams): Promise<unknown> {
    const res = await apiClient.get('/tourist/vouchers/available', {
      params: {
        PartnerId: params.partnerId,
        CurrentOrderAmount: params.currentOrderAmount,
      },
    })
    return res.data
  },

  async checkValid(
    params: CheckVoucherParams,
    errorFallback: string
  ): Promise<CheckVoucherResult> {
    try {
      const res = await apiClient.get('/tourist/vouchers/check-valid', {
        params: {
          Code: params.code,
          PartnerId: params.partnerId,
          CurrentOrderAmount: params.currentOrderAmount,
        },
      })
      return parseCheckVoucherValid(res.data)
    } catch (e) {
      return {
        ok: false,
        message: getAxiosErrorMessage(e, errorFallback),
      }
    }
  },
}