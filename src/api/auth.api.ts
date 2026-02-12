/**
 * Auth API module
 * Handles authentication-related API calls
 */

import { apiClient } from '../lib/apiClient'
import { API_ENDPOINTS } from '../lib/constants'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyForgotPasswordRequest,
  VerifyForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
} from '../types/auth.types'
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

/**
 * Register a new user
 * Creates a new user account and sends OTP to email
 */
export async function register(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<RegisterResponse> {
  const payload: RegisterRequest = {
    email,
    first_name: firstName,
    last_name: lastName,
    password,

  }

  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    API_ENDPOINTS.AUTH.REGISTER,
    payload,
    { skipAuth: true } // Registration doesn't require authentication
  )

  return response.data || response
}

/**
 * Verify email with OTP
 * Verifies the OTP sent to user's email after registration
 */
export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
  const payload: VerifyOTPRequest = { email, otp }

  const response = await apiClient.post<ApiResponse<VerifyOTPResponse>>(
    API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    payload,
    { skipAuth: true } // OTP verification doesn't require authentication
  )

  return response.data || response
}

/**
 * Resend OTP to user's email
 * Sends a new OTP code to the user's email address
 */
export async function resendOTP(email: string): Promise<ResendOTPResponse> {
  const payload: ResendOTPRequest = { email }

  const response = await apiClient.post<ApiResponse<ResendOTPResponse>>(
    API_ENDPOINTS.AUTH.RESEND_OTP,
    payload,
    { skipAuth: true } // Resend OTP doesn't require authentication
  )

  return response.data || response
}

/**
 * Forgot password
 * Sends reset OTP to user's email
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const payload: ForgotPasswordRequest = { email }

  const response = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    payload,
    { skipAuth: true }
  )

  return response.data || response
}

/**
 * Verify forgot password OTP
 * Returns reset access token in response.data.access_token
 */
export async function verifyForgotPassword(
  email: string,
  otp: string
): Promise<VerifyForgotPasswordResponse> {
  const payload: VerifyForgotPasswordRequest = { email, otp }

  const rawResponse = await apiClient.post<unknown>(
    API_ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD,
    payload,
    { skipAuth: true }
  )

  const response = rawResponse as
    | ApiResponse<VerifyForgotPasswordResponse>
    | VerifyForgotPasswordResponse

  const wrappedData =
    response && typeof response === 'object' && 'data' in response
      ? (response as ApiResponse<VerifyForgotPasswordResponse>).data
      : undefined

  const result: VerifyForgotPasswordResponse =
    wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData
      ? (wrappedData as VerifyForgotPasswordResponse)
      : (response as VerifyForgotPasswordResponse)

  const accessToken =
    result?.data?.access_token ||
    (wrappedData &&
    typeof wrappedData === 'object' &&
    'access_token' in wrappedData
      ? (wrappedData as { access_token?: string }).access_token
      : undefined)

  if (accessToken) {
    apiClient.setAccessToken(accessToken)
  }

  return result
}

/**
 * Reset password using temporary access token
 */
export async function resetPassword(password: string): Promise<ResetPasswordResponse> {
  const payload: ResetPasswordRequest = { password }

  const response = await apiClient.put<ApiResponse<ResetPasswordResponse>>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    payload
  )

  return response.data || response
}
