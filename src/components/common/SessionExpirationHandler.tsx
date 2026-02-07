/**
 * Session Expiration Handler
 * Handles session expiration globally
 */

import { ReactNode } from 'react'
import { useSessionExpiration } from '../../hooks/useSessionExpiration'

export interface SessionExpirationHandlerProps {
  children: ReactNode
}

/**
 * Session Expiration Handler
 * Wrapper component that handles session expiration events
 */
export function SessionExpirationHandler({
  children,
}: SessionExpirationHandlerProps) {
  useSessionExpiration()
  return <>{children}</>
}
