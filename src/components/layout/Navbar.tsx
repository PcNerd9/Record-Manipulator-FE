/**
 * Navbar Component
 * Navigation bar with user menu and logout
 */

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

/**
 * Navbar
 * Top navigation bar with user menu and logout
 */
export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-blue-700 text-xs font-bold text-white">
                DM
              </span>
              <span>Dataset Manager</span>
            </a>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden max-w-[180px] truncate md:block">{user?.email || 'User'}</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  role="menuitem"
                >
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
    </nav>
  )
}
