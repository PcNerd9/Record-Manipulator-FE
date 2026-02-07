/**
 * Session Expiration Hook
 * Handles session expiration events from API client
 */

import { useEffect } from 'react'
import { authStore } from '../state/auth.store'

/**
 * Use session expiration hook
 * Listens for session expiration events and redirects to login
 * Uses window.location instead of navigate to work outside Router context
 */
export function useSessionExpiration() {
  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear auth state
      authStore.logout().catch(console.error)
      
      // Redirect to login using window.location (works outside Router context)
      window.location.href = '/login'
    }

    window.addEventListener('session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener)
    }
  }, [])
}
