/**
 * Auth Store
 * Manages authentication state and actions
 */

import { login as loginAPI, logout as logoutAPI, getCurrentUser } from '../api/auth.api'
import { apiClient } from '../lib/apiClient'
import type { User, AuthState, AuthActions } from '../types/auth.types'

/**
 * Auth Store State
 */
class AuthStore {
  private state: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }

  private listeners: Set<() => void> = new Set()
  private isInitializing = false
  private isInitialized = false

  /**
   * Get current state
   */
  getState(): AuthState {
    return { ...this.state }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }

  /**
   * Update state
   */
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates }
    this.notify()
  }

  /**
   * Login action
   */
  async login(email: string, password: string): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      const response = await loginAPI(email, password)

      // Token is already stored in apiClient by loginAPI
      const token = apiClient.getAccessToken()

      this.setState({
        user: response.user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Login failed'

      this.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      })

      throw error
    }
  }

  /**
   * Logout action
   */
  async logout(): Promise<void> {
    this.setState({ isLoading: true })

    try {
      await logoutAPI()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear state, even if API call fails
      this.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      // Reset initialization flag on logout
      this.resetInitialization()
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    this.setState({ isLoading: true, error: null })

    try {
      const user = await getCurrentUser()

      if (user) {
        const token = apiClient.getAccessToken()
        this.setState({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        })
        return user
      } else {
        this.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return null
      }
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error.message as string)
          : 'Failed to get user'

      this.setState({
        isLoading: false,
        error: errorMessage,
      })

      return null
    }
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null })
  }

  /**
   * Initialize auth state
   * Check if user is already authenticated
   * Only initializes once to prevent infinite loops
   */
  async initialize(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing || this.isInitialized) {
      return
    }

    this.isInitializing = true

    try {
      const token = apiClient.getAccessToken()
      if (token) {
        // Try to get user to verify token is still valid
        await this.getUser()
      }
      this.isInitialized = true
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * Reset initialization flag (useful for logout)
   */
  resetInitialization(): void {
    this.isInitialized = false
    this.isInitializing = false
  }
}

/**
 * Auth Store Actions
 */
export const authStore = new AuthStore()

/**
 * Auth actions for use in components
 */
export const authActions: AuthActions = {
  login: (email: string, password: string) => authStore.login(email, password),
  logout: () => authStore.logout(),
  getUser: () => authStore.getUser(),
  clearError: () => authStore.clearError(),
}
