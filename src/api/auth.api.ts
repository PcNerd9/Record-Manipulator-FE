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
 * Token is stored in-memory via apiClient
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
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  } catch (error) {
    // Even if logout fails on backend, clear local state
    console.error('Logout error:', error)
  } finally {
    // Always clear token from memory
    apiClient.clearAccessToken()
  }
}

/**
 * Get current authenticated user
 * Fetches user information from backend
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
    return response.data || null
  } catch (error) {
    // If unauthorized, clear token and return null
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
 */
export async function refreshToken(): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH.REFRESH
  )

  // Update access token in apiClient
  if (response.data?.access_token) {
    apiClient.setAccessToken(response.data.access_token)
  }

  return response.data || response
}
