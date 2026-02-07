/**
 * Session Expiration Hook
 * Handles session expiration events from API client
 */

import { useEffect, useRef } from 'react'
import { authStore } from '../state/auth.store'

/**
 * Use session expiration hook
 * Listens for session expiration events and redirects to login
 * Uses window.location instead of navigate to work outside Router context
 * Prevents multiple simultaneous session expiration handlers
 */
export function useSessionExpiration() {
  const isHandling = useRef(false)

  useEffect(() => {
    const handleSessionExpired = () => {
      // Prevent multiple simultaneous handlers
      if (isHandling.current) {
        return
      }

      isHandling.current = true

      // Clear auth state (don't await - just fire and forget)
      authStore.logout().catch(() => {
        // Ignore errors - we're logging out anyway
      }).finally(() => {
        // Redirect to login using window.location (works outside Router context)
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        } else {
          isHandling.current = false
        }
      })
    }

    window.addEventListener('session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener)
      isHandling.current = false
    }
  }, [])
}
