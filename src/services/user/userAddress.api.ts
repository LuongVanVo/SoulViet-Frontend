import { apiClient } from '@/services/axios'
import type {
  UpsertUserAddressPayload,
  UserAddressDto,
  UserAddressMutationResponse,
} from '@/types'

const pick = <T>(a: T | undefined, b: T | undefined): T | undefined => a ?? b

function str(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function bool(v: unknown): boolean {
  return Boolean(v)
}

function mapAddress(raw: Record<string, unknown>): UserAddressDto {
  return {
    id: str(pick(raw.id, raw.Id)),
    receiverName: str(pick(raw.receiverName, raw.ReceiverName)),
    receiverPhone: str(pick(raw.receiverPhone, raw.ReceiverPhone)),
    province: str(pick(raw.province, raw.Province)),
    district: str(pick(raw.district, raw.District)),
    ward: str(pick(raw.ward, raw.Ward)),
    detailedAddress: str(pick(raw.detailedAddress, raw.DetailedAddress)),
    isDefault: bool(pick(raw.isDefault, raw.IsDefault)),
    fullAddress: str(pick(raw.fullAddress, raw.FullAddress)),
  }
}

function mapMutation(raw: Record<string, unknown>): UserAddressMutationResponse {
  return {
    success: bool(pick(raw.success, raw.Success)),
    message: str(pick(raw.message, raw.Message)),
    id: str(pick(raw.id, raw.Id)),
  }
}

function toCreatePayload(payload: UpsertUserAddressPayload) {
  return {
    userId: payload.userId,
    receiverName: payload.receiverName,
    receiverPhone: payload.receiverPhone,
    province: payload.province,
    district: payload.district ?? '',
    ward: payload.ward,
    detailedAddress: payload.detailedAddress,
    isDefault: payload.isDefault ?? false,
  }
}

function toUpdatePayload(payload: UpsertUserAddressPayload & { id: string }) {
  return {
    id: payload.id,
    userId: payload.userId,
    receiverName: payload.receiverName,
    receiverPhone: payload.receiverPhone,
    province: payload.province,
    district: payload.district ?? '',
    ward: payload.ward,
    detailedAddress: payload.detailedAddress,
    isDefault: payload.isDefault ?? undefined,
  }
}

export const userAddressApi = {
  async getMine(): Promise<UserAddressDto[]> {
    const res = await apiClient.get('/user-address')
    const data = res.data
    const rows = Array.isArray(data) ? data : []
    return rows.map((x) => mapAddress((x ?? {}) as Record<string, unknown>))
  },

  async create(payload: UpsertUserAddressPayload): Promise<UserAddressMutationResponse> {
    const res = await apiClient.post('/user-address', toCreatePayload(payload))
    return mapMutation((res.data ?? {}) as Record<string, unknown>)
  },

  async update(payload: UpsertUserAddressPayload & { id: string }): Promise<UserAddressMutationResponse> {
    const res = await apiClient.patch(`/user-address/${payload.id}`, toUpdatePayload(payload))
    return mapMutation((res.data ?? {}) as Record<string, unknown>)
  },

  async delete(id: string): Promise<boolean> {
    const res = await apiClient.delete(`/user-address/${id}`)
    return Boolean(res.data)
  },

  async setDefault(id: string): Promise<boolean> {
    const res = await apiClient.patch(`/user-address/${id}/set-default`)
    return Boolean(res.data)
  },
}