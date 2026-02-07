/**
 * Auth API module
 * Handles authentication-related API calls
 */

import { apiClient } from '../lib/apiClient'
import { API_ENDPOINTS } from '../lib/constants'
import type { LoginRequest, LoginResponse, User } from '../types/auth.types'
import type { ApiResponse } from '../types/api.types'

/**
 * Login with email and password
 * Returns access token and user object
 * Token is stored in localStorage via apiClient
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const payload: LoginRequest = { email, password }
  
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH.LOGIN,
    payload
  )

  // Store access token in apiClient (in-memory only)
  if (response.data?.access_token) {
    apiClient.setAccessToken(response.data.access_token)
  }

  // Return the login response data
  return response.data || response
}

/**
 * Logout - clears session on backend and frontend
 * Uses skipAuth to prevent triggering session expiration events
 */
export async function logout(): Promise<void> {
  try {
    // Use skipAuth to prevent logout from triggering session expiration
    // Logout is expected to work even if already logged out
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, { skipAuth: true })
  } catch (error) {
    // Even if logout fails on backend, clear local state
    // Don't log error - logout can fail if already logged out
  } finally {
    // Always clear token from memory
    apiClient.clearAccessToken()
  }
}

/**
 * Get current authenticated user
 * Fetches user information from backend using access token from localStorage
 * Does not trigger refresh attempts - this is a session check endpoint
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Call /me endpoint - uses access token from localStorage (via Authorization header)
    // Token is retrieved from localStorage in apiClient.getAccessToken()
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
    
    return response.data || null
  } catch (error) {
    // If unauthorized, clear token and return null
    // This is expected when user is not logged in or token is invalid
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number }
      if (apiError.status === 401 || apiError.status === 403) {
        apiClient.clearAccessToken()
      }
    }
    return null
  }
}

/**
 * Refresh access token
 * Uses HTTP-only cookie for refresh
 * This endpoint should not trigger auto-refresh (skipAuth prevents it)
 */
export async function refreshToken(): Promise<LoginResponse> {
  // Use skipAuth to prevent this endpoint from triggering refresh attempts
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH.REFRESH,
    undefined,
    { skipAuth: true } // Skip auth to prevent refresh loop
  )

  // Update access token in apiClient
  if (response.data?.access_token) {
    apiClient.setAccessToken(response.data.access_token)
  }

  return response.data || response
}
