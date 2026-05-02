import axios from 'axios'

/** Ưu tiên `detail` / `title` theo ProblemDetails ASP.NET Core */
export function getAxiosErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data != null && typeof data === 'object') {
      const o = data as Record<string, unknown>
      const detail = o.detail ?? o.Detail
      const title = o.title ?? o.Title
      const message = o.message ?? o.Message
      for (const v of [detail, title, message]) {
        if (typeof v === 'string' && v.trim()) return v.trim()
      }
      const errs = o.errors as Record<string, string[] | undefined> | undefined
      if (errs && typeof errs === 'object') {
        const firstKey = Object.keys(errs)[0]
        const arr = firstKey ? errs[firstKey] : undefined
        if (arr?.[0]) return arr[0]
      }
    }
    if (error.response?.status) {
      return `${fallback} (HTTP ${error.response.status})`
    }
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}