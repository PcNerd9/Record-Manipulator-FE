/**
 * App Shell Component
 * Main application layout wrapper
 */

import { ReactNode } from 'react'
import { Navbar } from './Navbar'

export interface AppShellProps {
  children: ReactNode
  showNavbar?: boolean
}

/**
 * App Shell
 * Provides the main layout structure for the application
 */
export function AppShell({ children, showNavbar = true }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Dataset Manipulator Platform
        </div>
      </footer>
    </div>
  )
}
