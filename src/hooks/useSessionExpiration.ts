/**
 * Session Expiration Hook
 * Handles session expiration events from API client
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../state/auth.store'

/**
 * Use session expiration hook
 * Listens for session expiration events and redirects to login
 */
export function useSessionExpiration() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear auth state
      authStore.logout().catch(console.error)
      
      // Redirect to login
      navigate('/login', { replace: true })
    }

    window.addEventListener('session-expired', handleSessionExpired as EventListener)

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired as EventListener)
    }
  }, [navigate])
}
