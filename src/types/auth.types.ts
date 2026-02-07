/**
 * Authentication types
 * Types related to user authentication and authorization
 */

/**
 * User object
 */
export interface User {
  id: string
  email: string
  name?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Login response
 */
export interface LoginResponse {
  access_token: string
  user: User
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string
  first_name: string
  last_name: string
  password: string
}

/**
 * Registration response
 */
export interface RegisterResponse {
  message: string
  user?: User
}

/**
 * Verify OTP request payload
 */
export interface VerifyOTPRequest {
  email: string
  otp: string
}

/**
 * Verify OTP response
 */
export interface VerifyOTPResponse {
  message: string
  success: boolean
}

/**
 * Resend OTP request payload
 */
export interface ResendOTPRequest {
  email: string
}

/**
 * Resend OTP response
 */
export interface ResendOTPResponse {
  message: string
  success: boolean
}

/**
 * Auth actions
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<User | null>
  clearError: () => void
}
