/**
 * Error Handler Utility
 * Utilities for extracting and handling error messages from API responses
 */

import { HTTP_STATUS } from '../lib/constants'
import type { ApiError } from '../types/api.types'

/**
 * Generic error message for 500 errors
 */
export const GENERIC_ERROR_MESSAGE = 'An error occurred. Please try again later.'

/**
 * Extract error message from API error
 * Returns the error message from the API response, or a generic message for 500 errors
 */
export function getErrorMessage(error: unknown, defaultMessage: string = GENERIC_ERROR_MESSAGE): string {
  // Handle 500 errors with generic message
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError
    if (apiError.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      return GENERIC_ERROR_MESSAGE
    }
    
    // For other errors, return the message from the API
    if (apiError.message) {
      return apiError.message
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || defaultMessage
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Default fallback
  return defaultMessage
}

/**
 * Check if error is a 500 error
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError
    return apiError.status === HTTP_STATUS.INTERNAL_SERVER_ERROR
  }
  return false
}

/**
 * Extract error message for form display
 * Returns error message for non-500 errors, null for 500 errors (to show generic message)
 */
export function getFormErrorMessage(error: unknown): string | null {
  if (isServerError(error)) {
    return null // Return null for 500 errors - form will show generic message
  }
  
  const message = getErrorMessage(error)
  return message !== GENERIC_ERROR_MESSAGE ? message : null
}
