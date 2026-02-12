/**
 * API Client - Transport Layer
 * Centralized HTTP client with cookie-aware requests, error handling, and token management
 */

import { API_BASE_URL } from './env'
import { ERROR_MESSAGES, HTTP_STATUS, API_ENDPOINTS } from './constants'
import type { ApiError, RequestOptions, ApiResponse } from '../types/api.types'
import type { LoginResponse } from '../types/auth.types'

/**
 * API Client class
 * Handles all HTTP requests with authentication, error handling, and cookie support
 */
export class APIClient {
  private baseUrl: string
  private isRefreshing = false
  private refreshPromise: Promise<string | null> | null = null
  private refreshFailed = false
  private lastRefreshAttempt: number = 0
  private readonly REFRESH_COOLDOWN = 5000 // 5 seconds cooldown after failed refresh
  private readonly TOKEN_STORAGE_KEY = 'access_token'

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
  }

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string | null): void {
    if (token) {
      try {
        localStorage.setItem(this.TOKEN_STORAGE_KEY, token)
      } catch (error) {
        console.error('Failed to save token to localStorage:', error)
      }
    } else {
      this.clearAccessToken()
    }
  }

  /**
   * Get current access token from localStorage
   */
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to read token from localStorage:', error)
      return null
    }
  }

  /**
   * Clear access token from localStorage
   */
  clearAccessToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error)
    }
    // Reset refresh state when clearing token
    this.refreshFailed = false
    this.isRefreshing = false
    this.refreshPromise = null
  }

  /**
   * Normalize API errors
   */
  private normalizeError(error: unknown, status: number): ApiError {
    const detailedError =
      error && typeof error === 'object' && 'detail' in error
        ? (error as { detail?: unknown }).detail
        : error

    if (detailedError && typeof detailedError === 'object' && 'message' in detailedError) {
      return {
        status,
        message: (detailedError as { message: string }).message,
        errors: (detailedError as { errors?: Record<string, string[]> }).errors,
        code: (detailedError as { code?: string }).code,
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
   * Refresh access token using refresh token cookie
   * Uses HTTP-only cookie for refresh token, returns new access token
   * Prevents infinite loops with cooldown and failure tracking
   */
  private async refreshAccessToken(): Promise<string | null> {
    // If refresh recently failed, don't try again immediately
    if (this.refreshFailed) {
      const timeSinceLastAttempt = Date.now() - this.lastRefreshAttempt
      if (timeSinceLastAttempt < this.REFRESH_COOLDOWN) {
        // Still in cooldown period, don't refresh
        return null
      }
      // Cooldown expired, reset failure flag
      this.refreshFailed = false
    }

    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.lastRefreshAttempt = Date.now()
    this.refreshPromise = (async () => {
      try {
        // Call refresh endpoint - uses refresh token from HTTP-only cookie
        // Don't send Authorization header (we're using cookies)
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
          method: 'POST',
          credentials: 'include', // Include cookies (refresh token)
          headers: {
            'Content-Type': 'application/json',
            // Explicitly don't include Authorization header - refresh uses cookies
          },
        })

        if (!response.ok) {
          // Refresh failed - mark as failed and set cooldown
          this.refreshFailed = true
          this.clearAccessToken()
          window.dispatchEvent(new CustomEvent('session-expired', {
            detail: { message: ERROR_MESSAGES.SESSION_EXPIRED }
          }))
          return null
        }

        const data = await response.json() as ApiResponse<LoginResponse>
        const accessToken = data.data?.access_token || (data as unknown as LoginResponse)?.access_token

        if (accessToken) {
          this.setAccessToken(accessToken)
          // Reset failure flag on success
          this.refreshFailed = false
          return accessToken
        }

        // No token in response - mark as failed
        this.refreshFailed = true
        return null
      } catch (error) {
        // Refresh failed - mark as failed and set cooldown
        this.refreshFailed = true
        this.clearAccessToken()
        window.dispatchEvent(new CustomEvent('session-expired', {
          detail: { message: ERROR_MESSAGES.SESSION_EXPIRED }
        }))
        return null
      } finally {
        this.isRefreshing = false
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
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
    // Get token from localStorage for each request
    if (!options.skipAuth) {
      const token = this.getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Core request method
   * Automatically refreshes access token on 401 errors
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    
    // Skip refresh for these endpoints to avoid infinite loops
    const isRefreshEndpoint = path === API_ENDPOINTS.AUTH.REFRESH
    const isMeEndpoint = path === API_ENDPOINTS.AUTH.ME
    const isLoginEndpoint = path === API_ENDPOINTS.AUTH.LOGIN
    const isLogoutEndpoint = path === API_ENDPOINTS.AUTH.LOGOUT
    
    // Don't attempt refresh for session check endpoints if no token exists
    // These are used to check if user is logged in, not protected resources
    const hasToken = !!this.getAccessToken()
    const shouldSkipRefresh = isRefreshEndpoint || isLoginEndpoint || isLogoutEndpoint || 
      (isMeEndpoint && !hasToken)
    
    try {
      let response = await fetch(url, {
        ...options,
        credentials: 'include', // Always include cookies (for refresh token)
        headers: this.buildHeaders(options),
      })


      // Handle 401 Unauthorized - try to refresh token
      // Only attempt refresh if:
      // 1. Not a special endpoint that should skip refresh
      // 2. Auth is not skipped
      // 3. Refresh hasn't recently failed (cooldown period)
      // 4. We have a token in localStorage (indicates we were previously authenticated)
      const hasToken = !!this.getAccessToken()
      if (
        response.status === HTTP_STATUS.UNAUTHORIZED && 
        !shouldSkipRefresh && 
        !options.skipAuth &&
        !this.refreshFailed &&
        hasToken // Only refresh if we had a token (were authenticated)
      ) {
        // Try to refresh the access token
        const newToken = await this.refreshAccessToken()
        
        if (newToken) {
          // Retry the original request with new token (only once)
          response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: this.buildHeaders(options),
          })
          
          // If retry still fails with 401, don't try to refresh again
          if (response.status === HTTP_STATUS.UNAUTHORIZED) {
            // Refresh didn't help, session is expired
            const error = await response.json().catch(() => ({}))
            const apiError = this.normalizeError(error, response.status)
            this.handleSessionExpiration()
            throw apiError
          }
        } else {
          // Refresh failed - session expired
          const error = await response.json().catch(() => ({}))
          const apiError = this.normalizeError(error, response.status)
          this.handleSessionExpiration()
          throw apiError
        }
      }


      // Handle non-OK responses
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))

        const apiError = this.normalizeError(error, response.status)

        // Handle session expiration (403 or if refresh failed)
        // But skip for endpoints that are expected to return 401 when not logged in
        const isLogoutEndpoint = path === API_ENDPOINTS.AUTH.LOGOUT
        const shouldHandleExpiration = this.isSessionExpired(response.status) && 
          !isLogoutEndpoint && 
          !isMeEndpoint &&
          !isLoginEndpoint &&
          !isRefreshEndpoint
        
        if (shouldHandleExpiration) {
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
