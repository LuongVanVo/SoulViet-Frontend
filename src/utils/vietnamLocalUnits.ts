import rawTree from '@/assets/xa_phuong_sau_sap_nhap_viet_nam.json'

export type VnWardRecord = {
  code: string
  fullName: string
  provinceCode: string
}

export type VnProvinceRecord = {
  code: string
  fullName: string
  wards: VnWardRecord[]
}

function readStr(v: unknown, fallback = ''): string {
  if (v == null) return fallback
  const s = String(v).trim()
  return s || fallback
}

function normalizeWard(w: Record<string, unknown>, provinceCode: string): VnWardRecord | null {
  const code = readStr(w.Code ?? w.code)
  const fullName = readStr(w.FullName ?? w.fullName ?? w.name)
  if (!code || !fullName) return null
  return {
    code,
    fullName,
    provinceCode: readStr(w.ProvinceCode ?? w.provinceCode, provinceCode),
  }
}

function normalizeProvince(p: Record<string, unknown>): VnProvinceRecord | null {
  const code = readStr(p.Code ?? p.code)
  if (!code) return null
  const fullName = readStr(p.FullName ?? p.fullName ?? p.name)
  const wardsRaw = (p.Wards ?? p.wards ?? []) as unknown[]
  const wards = wardsRaw
    .map((w) => normalizeWard(w as Record<string, unknown>, code))
    .filter((x): x is VnWardRecord => x != null)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
  return { code, fullName, wards }
}

export function parseVietnamProvinceTree(raw: unknown): VnProvinceRecord[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row) => normalizeProvince(row as Record<string, unknown>))
    .filter((x): x is VnProvinceRecord => x != null)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
}

export const VIETNAM_PROVINCE_TREE: VnProvinceRecord[] = parseVietnamProvinceTree(rawTree)

export function buildShippingAddressLine(
  streetLine: string,
  wardFullName: string | undefined,
  provinceFullName: string | undefined
): string {
  return [streetLine.trim(), wardFullName, provinceFullName].filter(Boolean).join(', ')
}