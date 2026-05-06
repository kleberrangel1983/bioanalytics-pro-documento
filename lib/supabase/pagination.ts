/**
 * Parse and validate pagination query params from a URL.
 * Returns a 422 error response if values are invalid (NaN or negative).
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { limit?: number; maxLimit?: number } = {}
): { limit: number; offset: number } | { error: string; status: 422 } {
  const rawLimit  = searchParams.get("limit")
  const rawOffset = searchParams.get("offset")
  const maxLimit  = defaults.maxLimit ?? 200
  const defLimit  = defaults.limit ?? 50

  const limit  = rawLimit  != null ? Number(rawLimit)  : defLimit
  const offset = rawOffset != null ? Number(rawOffset) : 0

  if (!Number.isInteger(limit)  || limit  < 1) return { error: "limit must be a positive integer",    status: 422 }
  if (!Number.isInteger(offset) || offset < 0) return { error: "offset must be a non-negative integer", status: 422 }

  return { limit: Math.min(limit, maxLimit), offset }
}
