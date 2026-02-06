/**
 * Generic API types
 * Common types used across API responses and requests
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * API error response
 */
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
  code?: string
}

/**
 * Request options for API calls
 */
export interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  timeout?: number
}
