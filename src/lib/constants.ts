/**
 * Application constants
 * Centralized constants for the application
 */

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    REFRESH: '/api/v1/auth/refresh',
    REGISTER: '/api/v1/auth/register',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_OTP: '/api/v1/auth/resend-otp',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_FORGOT_PASSWORD: '/api/v1/auth/verify-forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  // Dataset endpoints
  DATASETS: {
    LIST: '/api/v1/datasets',
    DETAIL: (id: string) => `/api/v1/datasets/${id}`,
    UPLOAD: '/api/v1/datasets/upload',
    DELETE: (id: string) => `/api/v1/datasets/${id}`,
    EXPORT: (id: string, format: 'csv' | 'excel') => 
      `/api/v1/datasets/${id}/export?format=${format}`,
  },
  // Record endpoints
  RECORDS: {
    LIST: (datasetId: string) => `/api/v1/datasets/${datasetId}/records`,
    CREATE: (datasetId: string) => `/api/v1/datasets/${datasetId}/records`,
    UPDATE: (datasetId: string) => `/api/v1/datasets/${datasetId}/records/batch`,
    DELETE: (datasetId: string, recordId: string) => 
      `/api/v1/datasets/${datasetId}/records/${recordId}`,
    SEARCH: (datasetId: string) => `/api/v1/datasets/${datasetId}/records/filter`,
  },
} as const

/**
 * Autosave configuration
 */
export const AUTOSAVE = {
  DELAY_MS: 30000, // 30 seconds
  BATCH_SIZE: 50, // Maximum records per batch
} as const

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
} as const

/**
 * HTTP Status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  AUTOSAVE_FAILED: 'Autosave failed. Your changes may not be saved.',
} as const

/**
 * Schema type mappings
 */
export const SCHEMA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  FLOAT: 'float',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
} as const

export type SchemaType = typeof SCHEMA_TYPES[keyof typeof SCHEMA_TYPES]
