/**
 * API Client - Transport Layer
 * Centralized HTTP client with cookie-aware requests, error handling, and token management
 */

import { API_BASE_URL } from './env'
import { ERROR_MESSAGES, HTTP_STATUS } from './constants'
import type { ApiError, RequestOptions } from '../types/api.types'

/**
 * API Client class
 * Handles all HTTP requests with authentication, error handling, and cookie support
 */
export class APIClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  /**
   * Set access token (in-memory only)
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = null
  }

  /**
   * Normalize API errors
   */
  private normalizeError(error: unknown, status: number): ApiError {
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        status,
        message: (error as { message: string }).message,
        errors: (error as { errors?: Record<string, string[]> }).errors,
        code: (error as { code?: string }).code,
      }
    }

    // Default error messages based on status
    const defaultMessages: Record<number, string> = {
      [HTTP_STATUS.UNAUTHORIZED]: ERROR_MESSAGES.UNAUTHORIZED,
      [HTTP_STATUS.FORBIDDEN]: ERROR_MESSAGES.UNAUTHORIZED,
      [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
      [HTTP_STATUS.UNPROCESSABLE_ENTITY]: ERROR_MESSAGES.VALIDATION_ERROR,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_MESSAGES.SERVER_ERROR,
    }

    return {
      status,
      message: defaultMessages[status] || ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }

  /**
   * Check if error indicates session expiration
   */
  private isSessionExpired(status: number): boolean {
    return status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpiration(): void {
    this.clearAccessToken()
    // Dispatch custom event for session expiration
    // Components can listen to this event to redirect to login
    window.dispatchEvent(new CustomEvent('session-expired', {
      detail: { message: ERROR_MESSAGES.SESSION_EXPIRED }
    }))
  }

  /**
   * Build request headers
   */
  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    // Add Content-Type for JSON requests (unless it's FormData)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Add Authorization header if token exists and auth is not skipped
    if (!options.skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    return headers
  }

  /**
   * Core request method
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Always include cookies
        headers: this.buildHeaders(options),
      })

      // Handle non-OK responses
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const apiError = this.normalizeError(error, response.status)

        // Handle session expiration
        if (this.isSessionExpired(response.status)) {
          this.handleSessionExpiration()
        }

        throw apiError
      }

      // Handle empty responses (204 No Content)
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return undefined as T
      }

      // Parse JSON response
      const data = await response.json()
      return data as T
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          status: 0,
          message: ERROR_MESSAGES.NETWORK_ERROR,
        } as ApiError
      }

      // Re-throw API errors
      if (error && typeof error === 'object' && 'status' in error) {
        throw error
      }

      // Unknown error
      throw {
        status: 500,
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
      } as ApiError
    }
  }

  /**
   * GET request
   */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  /**
   * PUT request
   */
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    })
  }
}

/**
 * Default API client instance
 * Export singleton instance for use throughout the application
 */
export const apiClient = new APIClient()
