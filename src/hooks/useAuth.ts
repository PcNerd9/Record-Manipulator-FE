/**
 * Auth Hook
 * React hook for authentication state and actions
 */

import { useState, useEffect, useCallback } from 'react'
import { authStore, authActions } from '../state/auth.store'
import type { AuthState, AuthActions } from '../types/auth.types'

/**
 * Use auth hook
 * Returns auth state and actions
 */
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>(() => authStore.getState())

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState())
    })

    // Initialize auth on mount
    authStore.initialize().catch(console.error)

    return unsubscribe
  }, [])

  // Wrap actions to ensure they're stable references
  const login = useCallback(
    (email: string, password: string) => authActions.login(email, password),
    []
  )

  const logout = useCallback(() => authActions.logout(), [])

  const getUser = useCallback(() => authActions.getUser(), [])

  const clearError = useCallback(() => authActions.clearError(), [])

  return {
    ...state,
    login,
    logout,
    getUser,
    clearError,
  }
}
